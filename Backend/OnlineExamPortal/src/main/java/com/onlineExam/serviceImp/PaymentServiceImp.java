package com.onlineExam.serviceImp;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.onlineExam.config.PhonePeConfig;
import com.onlineExam.dto.PaymentRequest;
import com.onlineExam.dto.PaymentResponse;
import com.onlineExam.entity.Institute;
import com.onlineExam.entity.Payment;
import com.onlineExam.repository.InstituteRepository;
import com.onlineExam.repository.PaymentRepository;
import com.onlineExam.service.PaymentActivationService;
import com.onlineExam.service.PaymentService;
import com.phonepe.sdk.pg.common.exception.PhonePeException;
import com.phonepe.sdk.pg.common.models.response.CallbackResponse;
import com.phonepe.sdk.pg.common.models.response.OrderStatusResponse;
import com.phonepe.sdk.pg.payments.v2.StandardCheckoutClient;
import com.phonepe.sdk.pg.payments.v2.models.request.StandardCheckoutPayRequest;
import com.phonepe.sdk.pg.payments.v2.models.response.StandardCheckoutPayResponse;

@Service
public class PaymentServiceImp implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InstituteRepository instituteRepository;

    @Autowired
    private PhonePeConfig phonePeConfig;

    @Autowired
    private PaymentActivationService paymentActivationService;


    @Override
    public PaymentResponse createPayment(PaymentRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Payment request cannot be null."
            );
        }

        if (request.getInstituteId() == null) {
            throw new IllegalArgumentException(
                    "Institute ID is required."
            );
        }

        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new IllegalArgumentException(
                    "Payment amount must be greater than zero."
            );
        }

        if (request.getPlanDuration() == null
                || request.getPlanDuration().isBlank()) {

            throw new IllegalArgumentException(
                    "Plan duration is required."
            );
        }

        if (request.getPlanPrice() == null
                || request.getPlanPrice().isBlank()) {

            throw new IllegalArgumentException(
                    "Plan price is required."
            );
        }


        // =========================================================
        // FETCH ORGANIZATION FROM DATABASE
        // =========================================================

        Institute institute = instituteRepository
                .findById(request.getInstituteId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Institute not found with ID: "
                                        + request.getInstituteId()
                        )
                );


        // =========================================================
        // VERIFY EMAIL IF PROVIDED
        // =========================================================

        if (request.getInstituteEmail() != null
                && !request.getInstituteEmail().isBlank()
                && !institute.getEmail()
                .equalsIgnoreCase(request.getInstituteEmail())) {

            throw new IllegalArgumentException(
                    "Institute email does not match the registered organization."
            );
        }


        // =========================================================
        // USE DATABASE VALUES
        // =========================================================

        String instituteName =
                institute.getInstituteName();

        String instituteEmail =
                institute.getEmail();


        // =========================================================
        // CREATE MERCHANT ORDER ID
        // =========================================================

        String merchantOrderId =
                "EXAMHUB-" + UUID.randomUUID();


        // =========================================================
        // CREATE LOCAL PAYMENT RECORD
        // =========================================================

        Payment payment = new Payment();

        payment.setInstituteId(
                institute.getId()
        );

        payment.setInstituteName(
                instituteName
        );

        payment.setInstituteEmail(
                instituteEmail
        );

        payment.setMerchantOrderId(
                merchantOrderId
        );

        payment.setAmount(
                request.getAmount()
        );

        payment.setPlanDuration(
                request.getPlanDuration()
        );

        payment.setPlanPrice(
                request.getPlanPrice()
        );

        payment.setStatus(
                "CREATED"
        );

        payment.setPaymentGateway(
                "PHONEPE"
        );


        Payment savedPayment =
                paymentRepository.save(payment);


        // =========================================================
        // CREATE PHONEPE CHECKOUT
        // =========================================================

        try {

            StandardCheckoutClient phonePeClient =
                    phonePeConfig.getClient();


            StandardCheckoutPayRequest payRequest =
                    StandardCheckoutPayRequest.builder()
                            .merchantOrderId(merchantOrderId)
                            .amount(request.getAmount())
                            .redirectUrl(
                                    phonePeConfig.getRedirectUrl()
                            )
                            .build();


            StandardCheckoutPayResponse payResponse =
                    phonePeClient.pay(payRequest);


            String checkoutUrl =
                    payResponse.getRedirectUrl();


            // =====================================================
            // PHONEPE ORDER CREATED
            // =====================================================

            savedPayment.setStatus(
                    "PENDING"
            );

            paymentRepository.save(
                    savedPayment
            );


            return new PaymentResponse(
                    true,
                    "Payment order created successfully.",
                    savedPayment.getId(),
                    merchantOrderId,
                    checkoutUrl,
                    "PENDING"
            );


        } catch (PhonePeException e) {

            // =====================================================
            // PHONEPE REQUEST FAILED
            // =====================================================

            savedPayment.setStatus(
                    "FAILED"
            );

            paymentRepository.save(
                    savedPayment
            );


            throw new IllegalStateException(
                    "Unable to create PhonePe payment order: "
                            + e.getMessage(),
                    e
            );


        } catch (RuntimeException e) {

            // =====================================================
            // OTHER PHONEPE / CONFIGURATION ERROR
            // =====================================================

            savedPayment.setStatus(
                    "FAILED"
            );

            paymentRepository.save(
                    savedPayment
            );


            throw e;
        }
    }


    // =========================================================
    // GET PHONEPE PAYMENT STATUS
    // =========================================================

    @Override
    public PaymentResponse getPaymentStatus(
            String merchantOrderId) {

        if (merchantOrderId == null
                || merchantOrderId.isBlank()) {

            throw new IllegalArgumentException(
                    "Merchant order ID is required."
            );
        }


        Payment payment =
                paymentRepository
                        .findByMerchantOrderId(
                                merchantOrderId
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Payment not found for merchant order ID: "
                                                + merchantOrderId
                                )
                        );


        StandardCheckoutClient phonePeClient =
                phonePeConfig.getClient();


        OrderStatusResponse orderStatusResponse =
                phonePeClient.getOrderStatus(
                        merchantOrderId
                );


        String phonePeState =
                orderStatusResponse.getState();


        String paymentStatus;


        if ("COMPLETED".equalsIgnoreCase(phonePeState)) {

            paymentStatus = "SUCCESS";

        } else if ("FAILED".equalsIgnoreCase(phonePeState)) {

            paymentStatus = "FAILED";

        } else {

            paymentStatus = "PENDING";
        }


        // =====================================================
        // SUCCESS → ACTIVATE ORGANIZATION
        // =====================================================

        payment.setStatus(
                paymentStatus
        );


        if ("SUCCESS".equalsIgnoreCase(paymentStatus)) {

            paymentActivationService
                    .activateAfterSuccessfulPayment(
                            payment
                    );
        }


        paymentRepository.save(
                payment
        );


        return new PaymentResponse(
                true,
                "Payment status fetched successfully.",
                payment.getId(),
                payment.getMerchantOrderId(),
                null,
                paymentStatus
        );
    }


    // =========================================================
    // PHONEPE CALLBACK / WEBHOOK
    // =========================================================

    @Override
    public void handlePhonePeCallback(
            String authorization,
            String responseBody) {

        if (authorization == null
                || authorization.isBlank()) {

            throw new IllegalArgumentException(
                    "PhonePe callback authorization is required."
            );
        }


        if (responseBody == null
                || responseBody.isBlank()) {

            throw new IllegalArgumentException(
                    "PhonePe callback response body is required."
            );
        }


        String callbackUsername =
                phonePeConfig.getCallbackUsername();

        String callbackPassword =
                phonePeConfig.getCallbackPassword();


        if (callbackUsername == null
                || callbackUsername.isBlank()) {

            throw new IllegalStateException(
                    "PhonePe callback username is not configured."
            );
        }


        if (callbackPassword == null
                || callbackPassword.isBlank()) {

            throw new IllegalStateException(
                    "PhonePe callback password is not configured."
            );
        }


        StandardCheckoutClient phonePeClient =
                phonePeConfig.getClient();


        try {

            CallbackResponse callbackResponse =
                    phonePeClient.validateCallback(
                            callbackUsername,
                            callbackPassword,
                            authorization,
                            responseBody
                    );


            String merchantOrderId =
                    callbackResponse
                            .getPayload()
                            .getOrderId();


            String state =
                    callbackResponse
                            .getPayload()
                            .getState();


            Payment payment =
                    paymentRepository
                            .findByMerchantOrderId(
                                    merchantOrderId
                            )
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "Payment not found for merchant order ID: "
                                                    + merchantOrderId
                                    )
                            );


            // =================================================
            // PAYMENT SUCCESS
            // =================================================

            if ("COMPLETED".equalsIgnoreCase(state)) {

                payment.setStatus(
                        "SUCCESS"
                );


                paymentActivationService
                        .activateAfterSuccessfulPayment(
                                payment
                        );


                paymentRepository.save(
                        payment
                );

            }


            // =================================================
            // PAYMENT FAILED
            // =================================================

            else if ("FAILED".equalsIgnoreCase(state)) {

                payment.setStatus(
                        "FAILED"
                );

                paymentRepository.save(
                        payment
                );

            }


            // =================================================
            // PAYMENT PENDING
            // =================================================

            else {

                payment.setStatus(
                        "PENDING"
                );

                paymentRepository.save(
                        payment
                );
            }


        } catch (PhonePeException e) {

            throw new IllegalArgumentException(
                    "Invalid PhonePe callback.",
                    e
            );
        }
    }

    @Override
    public String getLatestPaymentGateway(Long instituteId) {

        return paymentRepository
                .findTopByInstituteIdOrderByCreatedAtDesc(instituteId)
                .map(Payment::getPaymentGateway)
                .orElse("MANUAL");
    }
}


//package com.onlineExam.serviceImp;
//
//import java.util.UUID;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import com.onlineExam.config.PhonePeConfig;
//import com.onlineExam.dto.PaymentRequest;
//import com.onlineExam.dto.PaymentResponse;
//import com.onlineExam.entity.Payment;
//import com.onlineExam.repository.PaymentRepository;
//import com.onlineExam.service.PaymentService;
//import com.phonepe.sdk.pg.payments.v2.StandardCheckoutClient;
//import com.phonepe.sdk.pg.payments.v2.models.request.StandardCheckoutPayRequest;
//import com.phonepe.sdk.pg.payments.v2.models.response.StandardCheckoutPayResponse;
//import com.phonepe.sdk.pg.common.models.response.OrderStatusResponse;
//import com.phonepe.sdk.pg.common.models.response.CallbackResponse;
//import com.phonepe.sdk.pg.common.models.response.OrderStatusResponse;
//import com.phonepe.sdk.pg.common.exception.PhonePeException;
//import com.onlineExam.service.PaymentActivationService;
//
//@Service
//public class PaymentServiceImp implements PaymentService {
//
//    @Autowired
//    private PaymentRepository paymentRepository;
//
//    @Autowired
//    private PhonePeConfig phonePeConfig;
//
//    @Autowired
//    private PaymentActivationService paymentActivationService;
//
////    public PaymentServiceImp(
////            PaymentRepository paymentRepository,
////            PhonePeConfig phonePeConfig) {
////
////        this.paymentRepository = paymentRepository;
////        this.phonePeConfig = phonePeConfig;
////    }
//
//    @Override
//    public PaymentResponse createPayment(PaymentRequest request) {
//
//        if (request == null) {
//            throw new IllegalArgumentException("Payment request cannot be null.");
//        }
//
//        if (request.getAmount() == null || request.getAmount() <= 0) {
//            throw new IllegalArgumentException("Payment amount must be greater than zero.");
//        }
//
//        if (request.getInstituteId() == null) {
//            throw new IllegalArgumentException("Institute ID is required.");
//        }
//
//        if (request.getInstituteName() == null
//                || request.getInstituteName().isBlank()) {
//
//            throw new IllegalArgumentException("Institute name is required.");
//        }
//
//        if (request.getInstituteEmail() == null
//                || request.getInstituteEmail().isBlank()) {
//
//            throw new IllegalArgumentException("Institute email is required.");
//        }
//
//        String merchantOrderId =
//                "EXAMHUB-" + UUID.randomUUID();
//
//        Payment payment = new Payment();
//
//        payment.setInstituteId(request.getInstituteId());
//        payment.setInstituteName(request.getInstituteName());
//        payment.setInstituteEmail(request.getInstituteEmail());
//
//        payment.setMerchantOrderId(merchantOrderId);
//
//        payment.setAmount(request.getAmount());
//
//        payment.setPlanDuration(request.getPlanDuration());
//        payment.setPlanPrice(request.getPlanPrice());
//
//        payment.setStatus("CREATED");
//        payment.setPaymentGateway("PHONEPE");
//
//        Payment savedPayment =
//                paymentRepository.save(payment);
//
//        /*
//         * PhonePe credentials are currently not available.
//         *
//         * Therefore, the actual PhonePe API call will only work
//         * after client-id and client-secret are configured.
//         */
//
//        StandardCheckoutClient phonePeClient =
//                phonePeConfig.getClient();
//
//        StandardCheckoutPayRequest payRequest =
//                StandardCheckoutPayRequest.builder()
//                        .merchantOrderId(merchantOrderId)
//                        .amount(request.getAmount())
//                        .redirectUrl(phonePeConfig.getRedirectUrl())
//                        .build();
//
//        StandardCheckoutPayResponse payResponse =
//                phonePeClient.pay(payRequest);
//
//        String checkoutUrl =
//                payResponse.getRedirectUrl();
//
//        savedPayment.setStatus("PENDING");
//
//        paymentRepository.save(savedPayment);
//
//        return new PaymentResponse(
//                true,
//                "Payment order created successfully.",
//                savedPayment.getId(),
//                merchantOrderId,
//                checkoutUrl,
//                "PENDING"
//        );
//    }
//
//    @Override
//    public PaymentResponse getPaymentStatus(String merchantOrderId) {
//
//        if (merchantOrderId == null || merchantOrderId.isBlank()) {
//            throw new IllegalArgumentException(
//                    "Merchant order ID is required."
//            );
//        }
//
//        Payment payment = paymentRepository
//                .findByMerchantOrderId(merchantOrderId)
//                .orElseThrow(() ->
//                        new IllegalArgumentException(
//                                "Payment not found for merchant order ID: "
//                                        + merchantOrderId
//                        )
//                );
//
//        StandardCheckoutClient phonePeClient =
//                phonePeConfig.getClient();
//
//        OrderStatusResponse orderStatusResponse =
//                phonePeClient.getOrderStatus(merchantOrderId);
//
//        String phonePeState =
//                orderStatusResponse.getState();
//
//        String paymentStatus;
//
//        if ("COMPLETED".equalsIgnoreCase(phonePeState)) {
//
//            paymentStatus = "SUCCESS";
//
//        } else if ("FAILED".equalsIgnoreCase(phonePeState)) {
//
//            paymentStatus = "FAILED";
//
//        } else {
//
//            paymentStatus = "PENDING";
//        }
//
////        payment.setStatus(paymentStatus);
////
////        Payment updatedPayment =
////                paymentRepository.save(payment);
//
//        payment.setStatus(paymentStatus);
//
//        if ("SUCCESS".equalsIgnoreCase(paymentStatus)) {
//
//            paymentActivationService
//                    .activateAfterSuccessfulPayment(payment);
//
//            paymentRepository.save(payment);
//
//        } else {
//
//            paymentRepository.save(payment);
//        }
//
//        Payment updatedPayment = payment;
//
//        return new PaymentResponse(
//                true,
//                "Payment status fetched successfully.",
//                updatedPayment.getId(),
//                updatedPayment.getMerchantOrderId(),
//                null,
//                paymentStatus
//        );
//    }
//
//    @Override
//    public void handlePhonePeCallback(
//            String authorization,
//            String responseBody) {
//
//        if (authorization == null || authorization.isBlank()) {
//            throw new IllegalArgumentException(
//                    "PhonePe callback authorization is required."
//            );
//        }
//
//        if (responseBody == null || responseBody.isBlank()) {
//            throw new IllegalArgumentException(
//                    "PhonePe callback response body is required."
//            );
//        }
//
//        String callbackUsername =
//                phonePeConfig.getCallbackUsername();
//
//        String callbackPassword =
//                phonePeConfig.getCallbackPassword();
//
//        if (callbackUsername == null || callbackUsername.isBlank()) {
//            throw new IllegalStateException(
//                    "PhonePe callback username is not configured."
//            );
//        }
//
//        if (callbackPassword == null || callbackPassword.isBlank()) {
//            throw new IllegalStateException(
//                    "PhonePe callback password is not configured."
//            );
//        }
//
//        StandardCheckoutClient phonePeClient =
//                phonePeConfig.getClient();
//
//        try {
//
//            CallbackResponse callbackResponse =
//                    phonePeClient.validateCallback(
//                            callbackUsername,
//                            callbackPassword,
//                            authorization,
//                            responseBody
//                    );
//
//            String merchantOrderId =
//                    callbackResponse
//                            .getPayload()
//                            .getOrderId();
//
//            String state =
//                    callbackResponse
//                            .getPayload()
//                            .getState();
//
//            String event =
//                    callbackResponse.getEvent();
//
//            Payment payment =
//                    paymentRepository
//                            .findByMerchantOrderId(merchantOrderId)
//                            .orElseThrow(() ->
//                                    new IllegalArgumentException(
//                                            "Payment not found for merchant order ID: "
//                                                    + merchantOrderId
//                                    )
//                            );
//
//
//            if ("COMPLETED".equalsIgnoreCase(state)) {
//
//                payment.setStatus("SUCCESS");
//
//                paymentActivationService
//                        .activateAfterSuccessfulPayment(payment);
//
//                paymentRepository.save(payment);
//
//            } else if ("FAILED".equalsIgnoreCase(state)) {
//
//                payment.setStatus("FAILED");
//
//                paymentRepository.save(payment);
//
//            } else {
//
//                payment.setStatus("PENDING");
//
//                paymentRepository.save(payment);
//            }
//
//        } catch (PhonePeException e) {
//
//            throw new IllegalArgumentException(
//                    "Invalid PhonePe callback.",
//                    e
//            );
//        }
//    }
//}