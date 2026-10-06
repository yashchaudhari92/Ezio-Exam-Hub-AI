package com.onlineExam.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

@Entity
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long instituteId;

    private String instituteName;

    private String instituteEmail;

    private String merchantOrderId;

    private Long amount;

    private String planDuration;

    private String planPrice;

    private String status;

    private String paymentGateway;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    // =========================
    // Automatically set timestamps
    // =========================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }


    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
    }


    // =========================
    // Getters and Setters
    // =========================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getInstituteId() {
        return instituteId;
    }

    public void setInstituteId(Long instituteId) {
        this.instituteId = instituteId;
    }

    public String getInstituteName() {
        return instituteName;
    }

    public void setInstituteName(String instituteName) {
        this.instituteName = instituteName;
    }

    public String getInstituteEmail() {
        return instituteEmail;
    }

    public void setInstituteEmail(String instituteEmail) {
        this.instituteEmail = instituteEmail;
    }

    public String getMerchantOrderId() {
        return merchantOrderId;
    }

    public void setMerchantOrderId(String merchantOrderId) {
        this.merchantOrderId = merchantOrderId;
    }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public String getPlanDuration() {
        return planDuration;
    }

    public void setPlanDuration(String planDuration) {
        this.planDuration = planDuration;
    }

    public String getPlanPrice() {
        return planPrice;
    }

    public void setPlanPrice(String planPrice) {
        this.planPrice = planPrice;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentGateway() {
        return paymentGateway;
    }

    public void setPaymentGateway(String paymentGateway) {
        this.paymentGateway = paymentGateway;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}



//package com.onlineExam.entity;
//
//import java.time.LocalDateTime;
//
//import jakarta.persistence.Entity;
//import jakarta.persistence.GeneratedValue;
//import jakarta.persistence.GenerationType;
//import jakarta.persistence.Id;
//
//@Entity
//public class Payment {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    private Long instituteId;
//
//    private String instituteName;
//
//    private String instituteEmail;
//
//    private String merchantOrderId;
//
//    private Long amount;
//
//    private String planDuration;
//
//    private String planPrice;
//
//    private String status;
//
//    private String paymentGateway;
//
//    private LocalDateTime createdAt;
//
//    private LocalDateTime updatedAt;
//
//    public Long getId() {
//        return id;
//    }
//
//    public void setId(Long id) {
//        this.id = id;
//    }
//
//    public Long getInstituteId() {
//        return instituteId;
//    }
//
//    public void setInstituteId(Long instituteId) {
//        this.instituteId = instituteId;
//    }
//
//    public String getInstituteName() {
//        return instituteName;
//    }
//
//    public void setInstituteName(String instituteName) {
//        this.instituteName = instituteName;
//    }
//
//    public String getInstituteEmail() {
//        return instituteEmail;
//    }
//
//    public void setInstituteEmail(String instituteEmail) {
//        this.instituteEmail = instituteEmail;
//    }
//
//    public String getMerchantOrderId() {
//        return merchantOrderId;
//    }
//
//    public void setMerchantOrderId(String merchantOrderId) {
//        this.merchantOrderId = merchantOrderId;
//    }
//
//    public Long getAmount() {
//        return amount;
//    }
//
//    public void setAmount(Long amount) {
//        this.amount = amount;
//    }
//
//    public String getPlanDuration() {
//        return planDuration;
//    }
//
//    public void setPlanDuration(String planDuration) {
//        this.planDuration = planDuration;
//    }
//
//    public String getPlanPrice() {
//        return planPrice;
//    }
//
//    public void setPlanPrice(String planPrice) {
//        this.planPrice = planPrice;
//    }
//
//    public String getStatus() {
//        return status;
//    }
//
//    public void setStatus(String status) {
//        this.status = status;
//    }
//
//    public String getPaymentGateway() {
//        return paymentGateway;
//    }
//
//    public void setPaymentGateway(String paymentGateway) {
//        this.paymentGateway = paymentGateway;
//    }
//
//    public LocalDateTime getCreatedAt() {
//        return createdAt;
//    }
//
//    public void setCreatedAt(LocalDateTime createdAt) {
//        this.createdAt = createdAt;
//    }
//
//    public LocalDateTime getUpdatedAt() {
//        return updatedAt;
//    }
//
//    public void setUpdatedAt(LocalDateTime updatedAt) {
//        this.updatedAt = updatedAt;
//    }
//}