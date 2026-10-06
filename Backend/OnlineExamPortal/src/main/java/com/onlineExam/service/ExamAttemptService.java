package com.onlineExam.service;

import java.util.Map;

import com.onlineExam.entity.ExamAttempt;
import com.onlineExam.entity.ExamSubmissionDTO;

public interface ExamAttemptService {

	ExamAttempt processSubmission(ExamSubmissionDTO submission) throws Exception;
	void evaluateTestAttempts(Long testId, String instituteName);
	
}
