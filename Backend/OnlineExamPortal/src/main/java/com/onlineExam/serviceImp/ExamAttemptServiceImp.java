package com.onlineExam.serviceImp;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.onlineExam.entity.AttemptAnswer;
import com.onlineExam.entity.ExamAttempt;
import com.onlineExam.entity.ExamSubmissionDTO;
import com.onlineExam.entity.Questions;
import com.onlineExam.entity.Test;
import com.onlineExam.entity.User;
import com.onlineExam.repository.AttemptAnswerRepository;
import com.onlineExam.repository.ExamAttemptRepository;
import com.onlineExam.repository.QuestionsRepository;
import com.onlineExam.repository.TestRepository;
import com.onlineExam.repository.UserRepository;
import com.onlineExam.service.ExamAttemptService;

import jakarta.transaction.Transactional;

@Service
public class ExamAttemptServiceImp implements ExamAttemptService{
	
	@Autowired
    private ExamAttemptRepository examAttemptRepo;
    @Autowired
    private AttemptAnswerRepository attemptAnswerRepo;
    @Autowired
    private TestRepository testRepo;
    @Autowired
    private QuestionsRepository questionsRepo;
    @Autowired
    private GeminiService geminiService;

    
    @Override
    @Transactional
    public ExamAttempt processSubmission(ExamSubmissionDTO submission) throws Exception {
        Test test = testRepo.findById(submission.getTestId())
                .orElseThrow(() -> new Exception("Test not found"));
        boolean alreadyAttempted =
                examAttemptRepo.existsByUserEmailAndTest_Id(
                        submission.getUserEmail(),
                        submission.getTestId()
                );
        if (alreadyAttempted) {
            throw new RuntimeException("You have already attempted this test.");
        }
        ExamAttempt attempt = new ExamAttempt();
        attempt.setEvaluated(false);
        attempt.setUserName(submission.getUserName());
        attempt.setUserEmail(submission.getUserEmail());
        attempt.setInstituteName(submission.getInstituteName());
        attempt.setTabSwitchCount(submission.getTabSwitchCount());
        attempt.setTest(test);
        attempt.setAttemptedAt(
                ZonedDateTime.now(ZoneId.of("Asia/Kolkata")).toLocalDateTime()
        );
        List<AttemptAnswer> answerList = new ArrayList<>();
        Double totalMarks = 0.0;
        // MCQ (NO CHANGE)
        if ("MCQ".equalsIgnoreCase(test.getExamType())) {
            int passingMarks = Integer.parseInt(test.getPassingMarks());
            for (Map.Entry<String, String> entry : submission.getAnswers().entrySet()) {
                Long questionId = Long.parseLong(entry.getKey());
                Questions q = questionsRepo.findById(questionId).orElse(null);
                if (q == null) continue;

                AttemptAnswer ans = new AttemptAnswer();
                ans.setQuestionId(q.getQueId());
                ans.setQuestionText(q.getQuestions());
                ans.setOption1(q.getOption1());
                ans.setOption2(q.getOption2());
                ans.setOption3(q.getOption3());
                ans.setOption4(q.getOption4());
                ans.setCorrectAnswer(q.getAnswer());
                ans.setSelectedAnswer(entry.getValue());
                boolean isCorrect = q.getAnswer().equalsIgnoreCase(entry.getValue());
                Double marks = isCorrect ? q.getMarks() : 0.0;
                ans.setCorrect(isCorrect);
                ans.setMarksObtained(marks);
                ans.setMaxMarks(q.getMarks());
                ans.setExamAttempt(attempt);
                totalMarks += marks;
                answerList.add(ans);
            }
            attempt.setTotalMarks(totalMarks);
            int testTotalMarks = Integer.parseInt(test.getTestTotalMarks());
            double percentage = (totalMarks / testTotalMarks) * 100;
            attempt.setPercentage(Math.round(percentage * 100.0) / 100.0);
            attempt.setResult(totalMarks >= passingMarks ? "PASS" : "FAIL");
            attempt.setEvaluated(true);
        }
        // THEORY (NO AI HERE ❗)
        else {
            for (Map.Entry<String, String> entry : submission.getAnswers().entrySet()) {
                Long questionId = Long.parseLong(entry.getKey());
                Questions q = questionsRepo.findById(questionId).orElse(null);
                if (q == null) continue;
                AttemptAnswer ans = new AttemptAnswer();
                ans.setQuestionId(q.getQueId());
                ans.setQuestionText(q.getQuestions());
                ans.setSelectedAnswer(entry.getValue());
                ans.setMarksObtained(0.0);
                ans.setMaxMarks(q.getMarks());
                ans.setCorrect(false);
                ans.setExamAttempt(attempt);
                answerList.add(ans);
            }
            attempt.setTotalMarks(0.0);
            attempt.setPercentage(0.0);
            attempt.setResult("PENDING");
            attempt.setEvaluated(false);
        }
        attempt.setAnswers(answerList);
        return examAttemptRepo.save(attempt);
    }


    @Override
    @Transactional
    public void evaluateTestAttempts(Long testId, String instituteName) {
        List<ExamAttempt> attempts =
                examAttemptRepo.findByTest_IdAndInstituteName(testId, instituteName);
        // Collect ALL DATA
        List<Map<String, Object>> allStudentsData = new ArrayList<>();
        for (ExamAttempt attempt : attempts) {
            if (attempt.isEvaluated()) continue;
            Map<String, Object> studentMap = new HashMap<>();
            studentMap.put("attemptId", attempt.getId());
            List<Map<String, Object>> answersList = new ArrayList<>();
            for (AttemptAnswer ans : attempt.getAnswers()) {
                Questions q = questionsRepo.findById(ans.getQuestionId()).orElse(null);
                if (q == null) continue;
                Map<String, Object> ansMap = new HashMap<>();
                ansMap.put("questionId", q.getQueId());
                ansMap.put("question", q.getQuestions());
                ansMap.put("maxMarks", q.getMarks());
                ansMap.put("studentAnswer", ans.getSelectedAnswer());
                answersList.add(ansMap);
            }
            studentMap.put("answers", answersList);
            allStudentsData.add(studentMap);
        }
        // SINGLE AI CALL
        Map<Long, Map<Long, Double>> finalResult =
                geminiService.evaluateAllStudents(allStudentsData);
        for (ExamAttempt attempt : attempts) {
            if (attempt.isEvaluated()) continue;
            Map<Long, Double> studentMarks =
                    finalResult.getOrDefault(attempt.getId(), new HashMap<>());
            double totalMarks = 0.0;
            for (AttemptAnswer ans : attempt.getAnswers()) {
            	double aiMarks = studentMarks.getOrDefault(ans.getQuestionId(), 0.0);
            	double maxMarks = ans.getMaxMarks();

            	// 🔥 HARD LIMIT (AI cannot exceed max marks)
            	double finalMarks = Math.min(aiMarks, maxMarks);

            	// 🔥 SHORT ANSWER PENALTY (very important)
            	if (ans.getSelectedAnswer() != null && ans.getSelectedAnswer().length() < 20) {
            	    finalMarks = Math.min(finalMarks, maxMarks * 0.5); // max 50% for short answer
            	}

            	ans.setMarksObtained(finalMarks);
            	totalMarks += finalMarks;
            	
            	
            }
            double testTotalMarks =
                    Double.parseDouble(attempt.getTest().getTestTotalMarks());
            double percentage = (totalMarks / testTotalMarks) * 100;
            int passingMarks = Integer.parseInt(attempt.getTest().getPassingMarks());
            attempt.setTotalMarks(totalMarks);
            attempt.setPercentage(Math.round(percentage * 100.0) / 100.0);
            attempt.setResult(totalMarks >= passingMarks ? "PASS" : "FAIL");
            attempt.setEvaluated(true);
        }
        examAttemptRepo.saveAll(attempts);
    }
}
