package com.onlineExam.entity;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDate;

import jakarta.persistence.Entity;

@Entity
public class Institute {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String instituteName;
	private String email;
	private String password;
	private String phoneNo;
	private String address;
	private String instituteType;
	private String intituteLogo;
	private String plan;
	private String paymentImg;
	private LocalDate planDate;
    private LocalDate planExpiryDate;
	private String status;
	public Long getId() {
		return id;
	}
	public String getInstituteName() {
		return instituteName;
	}
	public String getEmail() {
		return email;
	}
	public String getPassword() {
		return password;
	}
	public String getPhoneNo() {
		return phoneNo;
	}
	public String getAddress() {
		return address;
	}
	public String getInstituteType() {
		return instituteType;
	}
	public String getIntituteLogo() {
		return intituteLogo;
	}
	public String getPlan() {
		return plan;
	}
	public String getPaymentImg() {
		return paymentImg;
	}
	public LocalDate getPlanDate() {
		return planDate;
	}
	public LocalDate getPlanExpiryDate() {
		return planExpiryDate;
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
	public void setEmail(String email) {
		this.email = email;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public void setPhoneNo(String phoneNo) {
		this.phoneNo = phoneNo;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public void setInstituteType(String instituteType) {
		this.instituteType = instituteType;
	}
	public void setIntituteLogo(String intituteLogo) {
		this.intituteLogo = intituteLogo;
	}
	public void setPlan(String plan) {
		this.plan = plan;
	}
	public void setPaymentImg(String paymentImg) {
		this.paymentImg = paymentImg;
	}
	public void setPlanDate(LocalDate planDate) {
		this.planDate = planDate;
	}
	public void setPlanExpiryDate(LocalDate planExpiryDate) {
		this.planExpiryDate = planExpiryDate;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	@Override
	public String toString() {
		return "Institute [id=" + id + ", instituteName=" + instituteName + ", email=" + email + ", password="
				+ password + ", phoneNo=" + phoneNo + ", address=" + address + ", instituteType=" + instituteType
				+ ", intituteLogo=" + intituteLogo + ", plan=" + plan + ", paymentImg=" + paymentImg + ", planDate="
				+ planDate + ", planExpiryDate=" + planExpiryDate + ", status=" + status + "]";
	}
	public Institute(Long id, String instituteName, String email, String password, String phoneNo, String address,
			String instituteType, String intituteLogo, String plan, String paymentImg, LocalDate planDate,
			LocalDate planExpiryDate, String status) {
		super();
		this.id = id;
		this.instituteName = instituteName;
		this.email = email;
		this.password = password;
		this.phoneNo = phoneNo;
		this.address = address;
		this.instituteType = instituteType;
		this.intituteLogo = intituteLogo;
		this.plan = plan;
		this.paymentImg = paymentImg;
		this.planDate = planDate;
		this.planExpiryDate = planExpiryDate;
		this.status = status;
	}
	public Institute() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	
}
