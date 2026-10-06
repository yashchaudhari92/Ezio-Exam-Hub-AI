package com.onlineExam.restController;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.onlineExam.dto.PaymentRequest;
import com.onlineExam.dto.PaymentResponse;
import com.onlineExam.service.PaymentService;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin
public class PaymentRestController {

    private final PaymentService paymentService;

    public PaymentRestController(
            PaymentService paymentService) {

        this.paymentService = paymentService;
    }

    @PostMapping("/create")
    public ResponseEntity<PaymentResponse> createPayment(
            @RequestBody PaymentRequest request) {

        PaymentResponse response =
                paymentService.createPayment(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{merchantOrderId}")
    public ResponseEntity<PaymentResponse> getPaymentStatus(
            @PathVariable String merchantOrderId) {

        PaymentResponse response =
                paymentService.getPaymentStatus(merchantOrderId);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/phonepe/webhook")
    public ResponseEntity<String> handlePhonePeWebhook(
            @RequestHeader(value = "Authorization", required = false)
            String authorization,
            @RequestBody String responseBody) {

        paymentService.handlePhonePeCallback(
                authorization,
                responseBody
        );

        return ResponseEntity.ok(
                "Callback received successfully."
        );
    }

    @GetMapping("/gateway/{instituteId}")
    public ResponseEntity<String> getLatestPaymentGateway(
            @PathVariable Long instituteId) {

        String gateway =
                paymentService.getLatestPaymentGateway(instituteId);

        return ResponseEntity.ok(gateway);
    }
}


//package com.onlineExam.restController;
//
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import com.onlineExam.dto.PaymentRequest;
//import com.onlineExam.dto.PaymentResponse;
//import com.onlineExam.service.PaymentService;
//
//@RestController
//@RequestMapping("/api/payment")
//@CrossOrigin
//public class PaymentRestController {
//
//    private final PaymentService paymentService;
//
//    public PaymentRestController(PaymentService paymentService) {
//        this.paymentService = paymentService;
//    }
//
//    @PostMapping("/create")
//    public ResponseEntity<PaymentResponse> createPayment(
//            @RequestBody PaymentRequest request) {
//
//        PaymentResponse response =
//                paymentService.createPayment(request);
//
//        return ResponseEntity.ok(response);
//    }
//
//    @GetMapping("/status/{merchantOrderId}")
//    public ResponseEntity<PaymentResponse> getPaymentStatus(
//            @PathVariable String merchantOrderId) {
//
//        PaymentResponse response =
//                paymentService.getPaymentStatus(merchantOrderId);
//
//        return ResponseEntity.ok(response);
//    }
//
//    @PostMapping("/phonepe/webhook")
//    public ResponseEntity<String> handlePhonePeWebhook(
//            @RequestHeader(value = "Authorization", required = false)
//            String authorization,
//            @RequestBody String responseBody) {
//
//        paymentService.handlePhonePeCallback(
//                authorization,
//                responseBody
//        );
//
//        return ResponseEntity.ok("Callback received successfully.");
//    }
//}