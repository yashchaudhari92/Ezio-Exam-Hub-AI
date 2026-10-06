package com.onlineExam.entity;

import jakarta.persistence.*;
@Entity
public class Help {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String phoneNo;
    private String message;

    private boolean replied = false;

    // ✅ Default constructor (MANDATORY)
    public Help() {}

    // ✅ Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNo() { return phoneNo; }
    public void setPhoneNo(String phoneNo) { this.phoneNo = phoneNo; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isReplied() { return replied; }
    public void setReplied(boolean replied) { this.replied = replied; }
}
