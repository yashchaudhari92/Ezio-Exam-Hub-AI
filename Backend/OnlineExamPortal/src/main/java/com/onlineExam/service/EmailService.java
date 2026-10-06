package com.onlineExam.service;

import java.time.LocalDate;

public interface EmailService {

//	User Registration Successfully Sending Mail	
	void sendRegistrationEmail(String toEmail, String name, String instituteName);
	
// Send User Otp
	void sendOtpEmail(String email, String otp);
	
//	Institute Registration Successfully Sending Mail
	void instituteRegistrationEmail(String toEmail, String name, String plan, LocalDate planDate, LocalDate expiryDate);
	
//	Institute Plan Exprity Alert Mail
	void sendExpiryAlertEmail(String toEmail, String name, LocalDate expiryDate);
	
//	User Help Reply
	void sendHelpReplyEmail(String toEmail, String name, String replyMessage);
}
