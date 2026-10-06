package com.onlineExam.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Teacher {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	
	private String teacherName;
    private String institude;
    private String phoneNo;
    private String email;
    private String password;
    private String status;
	public Long getId() {
		return id;
	}
	public String getTeacherName() {
		return teacherName;
	}
	public String getInstitude() {
		return institude;
	}
	public String getPhoneNo() {
		return phoneNo;
	}
	public String getEmail() {
		return email;
	}
	public String getPassword() {
		return password;
	}
	public String getStatus() {
		return status;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public void setTeacherName(String teacherName) {
		this.teacherName = teacherName;
	}
	public void setInstitude(String institude) {
		this.institude = institude;
	}
	public void setPhoneNo(String phoneNo) {
		this.phoneNo = phoneNo;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	@Override
	public String toString() {
		return "Teacher [id=" + id + ", teacherName=" + teacherName + ", institude=" + institude + ", phoneNo="
				+ phoneNo + ", email=" + email + ", password=" + password + ", status=" + status + "]";
	}
	public Teacher(Long id, String teacherName, String institude, String phoneNo, String email, String password,
			String status) {
		super();
		this.id = id;
		this.teacherName = teacherName;
		this.institude = institude;
		this.phoneNo = phoneNo;
		this.email = email;
		this.password = password;
		this.status = status;
	}
	public Teacher() {
		super();
		// TODO Auto-generated constructor stub
	}
    
}
