package com.onlineExam.restController;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.onlineExam.service.QuestionsService;

@RestController
@RequestMapping("/api/question")
@CrossOrigin("*")
public class QuestionsRestController {

	@Autowired
	private QuestionsService questionsService;
}
