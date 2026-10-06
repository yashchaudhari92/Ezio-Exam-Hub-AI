package com.onlineExam.serviceImp;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import com.onlineExam.service.EmailService;

@Service
public class EmailServiceImpl implements EmailService{

	@Autowired
    private JavaMailSender mailSender;
	
//	User Registration Successfully Sending Mail
	@Override
    public void sendRegistrationEmail(String toEmail, String name, String instituteName) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Welcome to " + instituteName + " – Registration Successful!");

            String htmlContent = """
            <html>
            <body style="font-family: Arial, sans-serif; margin:0; padding:0; background:#f4f4f4;">
                <div style="max-width:600px; margin:20px auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <div style="background:#0056b3; padding:20px; text-align:center; color:#ffffff;">
                        <h2 style="margin:0;">%s</h2>
                        <p style="margin:0;">Boost your confidence with our Online Exam</p>
                    </div>

                    <!-- Success Badge -->
                    <div style="text-align:center; padding:30px 20px;">
                        <div style="display:inline-block; padding:15px 25px; background:#28a745; color:white; border-radius:50px; font-size:18px; font-weight:bold;">
                            ✓ Registration Successful!
                        </div>
                    </div>

                    <!-- Body Content -->
                    <div style="padding:25px; color:#333333; font-size:15px; line-height:1.6;">
                        <p>Dear <strong>%s</strong>,</p>
                        <p>
                            Thank you for registering with <strong>%s</strong>.
                            <br/>Your account has been successfully created.
                        </p>
                        <p>
                            We are excited to have you as part of our Organization.
                            You will now receive updates, learning material, and important notifications.
                        </p>
                        <p style="margin-top:20px;">
                            Best regards,<br/>
                            <strong>%s Team</strong>
                        </p>
                    </div>

                    <!-- Footer -->
                    <div style="background:#f1f1f1; padding:15px; text-align:center; font-size:12px; color:#555;">
                        © 2025 %s. All Rights Reserved.
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                    instituteName,
                    name,
                    instituteName,
                    instituteName,
                    instituteName
            );

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }	
	
	@Override
	public void sendOtpEmail(String to, String otp) {
	    SimpleMailMessage msg = new SimpleMailMessage();
	    msg.setTo(to);
	    msg.setSubject("Registration OTP");
	    msg.setText("Your OTP is: " + otp);
	    mailSender.send(msg);
	}	
	
//	Organization Registratin Successfull Email
	@Override
    public void instituteRegistrationEmail(String toEmail, String name, String plan,
                                      LocalDate planDate, LocalDate expiryDate) {

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Registration Successful – Ezio Exam Hub");

            String htmlContent = """
            <html>
            <body style="font-family: Arial; background:#f4f4f4;">
                <div style="max-width:600px;margin:auto;background:white;border-radius:10px;padding:20px;">
                    
                    <h2 style="background:#0056b3;color:white;padding:15px;border-radius:10px;">
                        Ezio Exam Hub - Registration Successful
                    </h2>

                    <p>Hello <strong>%s</strong>,</p>

                    <p>Your account has been successfully created. Below are your plan details:</p>

                    <table style="width:100%%;border-collapse:collapse;margin-top:15px;">
                        <tr>
                            <td style="padding:8px;border:1px solid #ccc;">Selected Plan</td>
                            <td style="padding:8px;border:1px solid #ccc;"><strong>%s</strong></td>
                        </tr>
                        <tr>
                            <td style="padding:8px;border:1px solid #ccc;">Plan Start Date</td>
                            <td style="padding:8px;border:1px solid #ccc;">%s</td>
                        </tr>
                        <tr>
                            <td style="padding:8px;border:1px solid #ccc;">Plan Expiry Date</td>
                            <td style="padding:8px;border:1px solid #ccc;">%s</td>
                        </tr>
                    </table>

                    <p style="margin-top:20px;">Thank you,<br><strong>Ezio Exam Hub Team</strong></p>

                </div>
            </body>
            </html>
            """.formatted(
                    name, plan, planDate.toString(), expiryDate.toString()
            );

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
	
//	Plen Expriry Institute Alert Mail
	@Override
	public void sendExpiryAlertEmail(String toEmail, String name, LocalDate expiryDate) {

	    try {
	        MimeMessage mimeMessage = mailSender.createMimeMessage();
	        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

	        helper.setTo(toEmail);
	        helper.setSubject("Your Organization Plan is Expiring Soon");

	        String html = """
	        <html>
	        <body style="font-family: Arial; background:#f4f4f4;">
	            <div style="max-width:600px;margin:auto;background:white;padding:20px;border-radius:10px;">
	                
	                <h2 style="background:#dc3545;color:white;padding:15px;border-radius:10px;">
	                    Plan Expiry Reminder
	                </h2>

	                <p>Hello <strong>%s</strong>,</p>

	                <p>
	                    This is a reminder that your current plan will expire on:
	                </p>

	                <h3 style="color:#dc3545;">%s</h3>

	                <p>Please renew your plan before expiry to avoid service interruption.</p>

	                <p>Regards,<br><strong>Ezio Exam Hub Team</strong></p>
	            </div>
	        </body>
	        </html>
	        """.formatted(name, expiryDate.toString());

	        helper.setText(html, true);
	        mailSender.send(mimeMessage);

	    } catch (Exception e) {
	        e.printStackTrace();
	    }
	}
	
//	User Help Reply
	@Override
	public void sendHelpReplyEmail(String toEmail, String name, String replyMessage) {
	    try {
	        MimeMessage mimeMessage = mailSender.createMimeMessage();
	        MimeMessageHelper helper =
	                new MimeMessageHelper(mimeMessage, true, "UTF-8");

	        helper.setTo(toEmail);
	        helper.setSubject("Reply to Your Help Request");
	        String html = """
	        <html>
	        <body style="font-family:Arial;">
	            <h3>Hello Sir,</h3>
	            <p>%s</p>
	            <br/>
	            <p>Regards,<br/><b>Ezio Exam Hub Team</b></p>
	        </body>
	        </html>
	        """.formatted(name, replyMessage);

	        helper.setText(html, true);
	        mailSender.send(mimeMessage);

	    } catch (Exception e) {
	        e.printStackTrace();
	    }
	}

	
}
