package com.onlineExam.service;

import com.onlineExam.dto.PaymentRequest;
import com.onlineExam.dto.PaymentResponse;

public interface PaymentService {

    PaymentResponse createPayment(PaymentRequest request);

    PaymentResponse getPaymentStatus(String merchantOrderId);

    void handlePhonePeCallback(
            String authorization,
            String responseBody
    );

    String getLatestPaymentGateway(Long instituteId);
}