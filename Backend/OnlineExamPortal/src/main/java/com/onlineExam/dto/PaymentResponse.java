package com.onlineExam.dto;

public class PaymentResponse {

    private boolean success;
    private String message;
    private Long paymentId;
    private String merchantOrderId;
    private String checkoutUrl;
    private String status;

    public PaymentResponse() {
    }

    public PaymentResponse(
            boolean success,
            String message,
            Long paymentId,
            String merchantOrderId,
            String checkoutUrl,
            String status) {

        this.success = success;
        this.message = message;
        this.paymentId = paymentId;
        this.merchantOrderId = merchantOrderId;
        this.checkoutUrl = checkoutUrl;
        this.status = status;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public String getMerchantOrderId() {
        return merchantOrderId;
    }

    public void setMerchantOrderId(String merchantOrderId) {
        this.merchantOrderId = merchantOrderId;
    }

    public String getCheckoutUrl() {
        return checkoutUrl;
    }

    public void setCheckoutUrl(String checkoutUrl) {
        this.checkoutUrl = checkoutUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}