package com.onlineExam.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.onlineExam.entity.Test;

public interface TestService {

	Test saveTestData(String institude, String institudeEmail, String topicName, String examType, String language,
            String duration, String testTotalQuestion, String testTotalMarks, String passingMarks, String resultTime, MultipartFile file) throws Exception;
	
	List<Test> getTestsByInstitute(String institude);
	
	List<Test> getAllTests();
	List<Test> getTestsByInstituteAndLanguage(String institude, String language);
	Test getTestById(Long id);
	
	public Test updateTest(Long id, String institude, String topicName, String examType, String language,
            String duration, String testTotalQuestion, String testTotalMarks, String passingMarks, String resultTime, MultipartFile file) throws Exception;

	
	void deleteTestById(Long testId) throws Exception;

	void approveInstituteTest(Long testId, String instituteEmail);
}
