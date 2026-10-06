package com.onlineExam.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Transient;

@Entity
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String name;
	private String email;
	private String phoneNo;
	private String password;
	private String institute;
	private String status;
	@Transient
	private String otp;
	public Long getId() {
		return id;
	}
	public String getName() {
		return name;
	}
	public String getEmail() {
		return email;
	}
	public String getPhoneNo() {
		return phoneNo;
	}
	public String getPassword() {
		return password;
	}
	public String getInstitute() {
		return institute;
	}
	public String getStatus() {
		return status;
	}
	public String getOtp() {
		return otp;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public void setName(String name) {
		this.name = name;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public void setPhoneNo(String phoneNo) {
		this.phoneNo = phoneNo;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public void setInstitute(String institute) {
		this.institute = institute;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public void setOtp(String otp) {
		this.otp = otp;
	}
	@Override
	public String toString() {
		return "User [id=" + id + ", name=" + name + ", email=" + email + ", phoneNo=" + phoneNo + ", password="
				+ password + ", institute=" + institute + ", status=" + status + ", otp=" + otp + "]";
	}
	public User(Long id, String name, String email, String phoneNo, String password, String institute, String status,
			String otp) {
		super();
		this.id = id;
		this.name = name;
		this.email = email;
		this.phoneNo = phoneNo;
		this.password = password;
		this.institute = institute;
		this.status = status;
		this.otp = otp;
	}
	public User() {
		super();
		// TODO Auto-generated constructor stub
	}
}
