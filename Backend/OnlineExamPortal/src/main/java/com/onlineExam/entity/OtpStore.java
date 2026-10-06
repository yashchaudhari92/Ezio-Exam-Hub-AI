package com.onlineExam.entity;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

@Component
public class OtpStore {
    private Map<String, String> otpMap = new HashMap<>();

    public void saveOtp(String email, String otp) {
        otpMap.put(email, otp);
    }

    public boolean verifyOtp(String email, String otp) {
        return otp.equals(otpMap.get(email));
    }

    public void clear(String email) {
        otpMap.remove(email);
    }
}

