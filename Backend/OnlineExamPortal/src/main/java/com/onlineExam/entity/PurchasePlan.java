package com.onlineExam.entity;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class PurchasePlan {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String instituteName;
	private String duration;
	private String price;
	private LocalDate planDate;
    private LocalDate planExpiryDate;
	private String paymentGateway;
	private String paymentImg;
	private String status;
	public Long getId() {
		return id;
	}
	public String getInstituteName() {
		return instituteName;
	}
	public String getDuration() {
		return duration;
	}
	public String getPrice() {
		return price;
	}
	public LocalDate getPlanDate() {
		return planDate;
	}
	public LocalDate getPlanExpiryDate() {
		return planExpiryDate;
	}
	public String getPaymentGateway() {
		return paymentGateway;
	}
	public String getPaymentImg() {
		return paymentImg;
	}
	public String getStatus() {
		return status;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public void setInstituteName(String instituteName) {
		this.instituteName = instituteName;
	}
	public void setDuration(String duration) {
		this.duration = duration;
	}
	public void setPrice(String price) {
		this.price = price;
	}
	public void setPlanDate(LocalDate planDate) {
		this.planDate = planDate;
	}
	public void setPlanExpiryDate(LocalDate planExpiryDate) {
		this.planExpiryDate = planExpiryDate;
	}
	public void setPaymentGateway(String paymentGateway) {
		this.paymentGateway = paymentGateway;
	}
	public void setPaymentImg(String paymentImg) {
		this.paymentImg = paymentImg;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	@Override
	public String toString() {
		return "PurchasePlan [id=" + id + ", instituteName=" + instituteName + ", duration=" + duration + ", price="
				+ price + ", planDate=" + planDate + ", planExpiryDate=" + planExpiryDate + ", paymentImg=" + paymentImg
				+ ", status=" + status + "]";
	}
	public PurchasePlan(Long id, String instituteName, String duration, String price, LocalDate planDate,
			LocalDate planExpiryDate, String paymentImg, String status) {
		super();
		this.id = id;
		this.instituteName = instituteName;
		this.duration = duration;
		this.price = price;
		this.planDate = planDate;
		this.planExpiryDate = planExpiryDate;
		this.paymentImg = paymentImg;
		this.status = status;
	}
	public PurchasePlan() {
		super();
		// TODO Auto-generated constructor stub
	}
	
}
