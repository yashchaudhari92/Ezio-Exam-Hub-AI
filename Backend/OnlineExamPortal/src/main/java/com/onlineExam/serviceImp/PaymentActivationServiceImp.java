package com.onlineExam.serviceImp;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.onlineExam.entity.Institute;
import com.onlineExam.entity.Payment;
import com.onlineExam.entity.PurchasePlan;
import com.onlineExam.repository.InstituteRepository;
import com.onlineExam.repository.PurchasePlanRepository;
import com.onlineExam.service.PaymentActivationService;

import jakarta.transaction.Transactional;

@Service
public class PaymentActivationServiceImp
        implements PaymentActivationService {

    @Autowired
    private InstituteRepository instituteRepo;

    @Autowired
    private PurchasePlanRepository purchasePlanRepo;

    @Override
    @Transactional
    public void activateAfterSuccessfulPayment(Payment payment) {

        if (payment == null) {
            throw new IllegalArgumentException(
                    "Payment information is required."
            );
        }

        if (!"SUCCESS".equalsIgnoreCase(payment.getStatus())) {
            throw new IllegalArgumentException(
                    "Only successful payments can activate an institute."
            );
        }

        if (payment.getInstituteId() == null) {
            throw new IllegalArgumentException(
                    "Institute ID is required for activation."
            );
        }

        Institute institute = instituteRepo
                .findById(payment.getInstituteId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Institute not found with ID: "
                                        + payment.getInstituteId()
                        )
                );

        // ============================================
        // Security check
        // ============================================

        if (payment.getInstituteEmail() != null
                && !payment.getInstituteEmail().isBlank()
                && institute.getEmail() != null
                && !institute.getEmail().equalsIgnoreCase(
                payment.getInstituteEmail())) {

            throw new IllegalArgumentException(
                    "Payment institute email does not match institute email."
            );
        }

        // ============================================
        // Validate plan information
        // ============================================

        String planDuration = payment.getPlanDuration();
        String planPrice = payment.getPlanPrice();

        if (planDuration == null || planDuration.isBlank()) {
            throw new IllegalArgumentException(
                    "Plan duration is required."
            );
        }

        if (planPrice == null || planPrice.isBlank()) {
            throw new IllegalArgumentException(
                    "Plan price is required."
            );
        }

        // ============================================
        // Calculate plan dates
        // ============================================

        LocalDate planDate = LocalDate.now();

        int months = extractMonths(planDuration);

        LocalDate planExpiryDate =
                planDate.plusMonths(months);

        // ============================================
        // Activate Institute
        // ============================================

        institute.setStatus("Active");

        institute.setPlan(
                planDuration + " (₹" + planPrice + ")"
        );

        institute.setPlanDate(planDate);

        institute.setPlanExpiryDate(planExpiryDate);

        /*
         * PhonePe payment does not use a screenshot.
         *
         * Therefore we intentionally do NOT set
         * institute.paymentImg here.
         *
         * Existing manual screenshot-payment logic
         * remains untouched.
         */

        instituteRepo.save(institute);

        // ============================================
        // Save Purchase Plan History
        // ============================================

        createPurchasePlanHistory(
                institute,
                planDuration,
                planPrice,
                planDate,
                planExpiryDate
        );
    }

    private void createPurchasePlanHistory(
            Institute institute,
            String planDuration,
            String planPrice,
            LocalDate planDate,
            LocalDate planExpiryDate) {

        /*
         * PhonePe may send the same successful event more
         * than once, so avoid creating duplicate records
         * for the same active plan on the same date.
         */

        List<PurchasePlan> existingPlans =
                purchasePlanRepo.findByInstituteName(
                        institute.getInstituteName()
                );

        boolean alreadyExists = existingPlans.stream()
                .anyMatch(pp ->
                        "ACTIVE".equalsIgnoreCase(pp.getStatus())
                                && planDuration.equals(pp.getDuration())
                                && planPrice.equals(pp.getPrice())
                                && planDate.equals(pp.getPlanDate())
                );

        if (alreadyExists) {
            return;
        }

        PurchasePlan purchasePlan =
                new PurchasePlan();

        purchasePlan.setInstituteName(
                institute.getInstituteName()
        );

        purchasePlan.setDuration(planDuration);

        purchasePlan.setPrice(planPrice);

        purchasePlan.setPlanDate(planDate);

        purchasePlan.setPlanExpiryDate(
                planExpiryDate
        );

        /*
         * PhonePe does not require a payment screenshot.
         * Keep this NULL instead of creating fake image data.
         */
        purchasePlan.setPaymentImg(null);

        purchasePlan.setStatus("ACTIVE");

        purchasePlan.setPaymentGateway("PHONEPE");

        purchasePlanRepo.save(purchasePlan);
    }

    private int extractMonths(String planDuration) {

        try {

            String firstPart =
                    planDuration.trim().split("\\s+")[0];

            int months =
                    Integer.parseInt(firstPart);

            if (months <= 0) {
                throw new IllegalArgumentException(
                        "Plan duration must be greater than zero."
                );
            }

            return months;

        } catch (NumberFormatException e) {

            throw new IllegalArgumentException(
                    "Invalid plan duration: "
                            + planDuration
                            + ". Expected format like '1 Month'."
            );
        }
    }
}