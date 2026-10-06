package com.onlineExam.service;

import com.onlineExam.entity.Payment;

public interface PaymentActivationService {

    void activateAfterSuccessfulPayment(Payment payment);
}