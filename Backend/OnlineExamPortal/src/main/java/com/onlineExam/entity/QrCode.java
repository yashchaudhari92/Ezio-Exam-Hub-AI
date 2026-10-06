package com.onlineExam.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class QrCode {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String upiId; 
	private String upiName;
	public Long getId() {
		return id;
	}
	public String getUpiId() {
		return upiId;
	}
	public String getUpiName() {
		return upiName;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public void setUpiId(String upiId) {
		this.upiId = upiId;
	}
	public void setUpiName(String upiName) {
		this.upiName = upiName;
	}
	@Override
	public String toString() {
		return "QrCode [id=" + id + ", upiId=" + upiId + ", upiName=" + upiName + "]";
	}
	public QrCode(Long id, String upiId, String upiName) {
		super();
		this.id = id;
		this.upiId = upiId;
		this.upiName = upiName;
	}
	public QrCode() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	
	
}
