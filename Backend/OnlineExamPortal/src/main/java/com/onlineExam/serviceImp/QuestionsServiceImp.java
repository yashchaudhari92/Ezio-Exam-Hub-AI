package com.onlineExam.serviceImp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.onlineExam.repository.QuestionsRepository;
import com.onlineExam.service.QuestionsService;

@Service
public class QuestionsServiceImp implements QuestionsService{
	@Autowired
	private QuestionsRepository questionsRepo;
}
