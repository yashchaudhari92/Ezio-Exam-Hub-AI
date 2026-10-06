package com.onlineExam.restController;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.onlineExam.entity.AttemptAnswer;
import com.onlineExam.repository.AttemptAnswerRepository;

@RestController
@RequestMapping("/api/attempt-answer")
@CrossOrigin("*")
public class AttemptAnswerRestController {

    @Autowired
    private AttemptAnswerRepository attemptAnswerRepos;

    // ✅ Get all answers by Exam Attempt ID (Exam Review)
    @GetMapping("/by-attempt/{attemptId}")
    public List<AttemptAnswer> getAnswersByAttemptId(
            @PathVariable Long attemptId) {

        return attemptAnswerRepos.findByExamAttemptId(attemptId);
    }
}

