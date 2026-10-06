package com.onlineExam.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.onlineExam.entity.PurchasePlan;

public interface PurchasePlanService {
	void buyPlan(Long instituteId, String planDuration, String price, MultipartFile file) throws Exception;
	List<PurchasePlan> getByInstitute(String instituteName);
	
	void updateStatus(Long id, String status);
}
