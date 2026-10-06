package com.onlineExam.entity;

import jakarta.persistence.*;
import jakarta.persistence.Id;

@Entity
public class Plan {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String duration;
	private String price;
	private String status;
	public Long getId() {
		return id;
	}
	public String getDuration() {
		return duration;
	}
	public String getPrice() {
		return price;
	}
	public String getStatus() {
		return status;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public void setDuration(String duration) {
		this.duration = duration;
	}
	public void setPrice(String price) {
		this.price = price;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	@Override
	public String toString() {
		return "Plan [id=" + id + ", duration=" + duration + ", price=" + price + ", status=" + status + "]";
	}
	public Plan(Long id, String duration, String price, String status) {
		super();
		this.id = id;
		this.duration = duration;
		this.price = price;
		this.status = status;
	}
	public Plan() {
		super();
	}
	
}
