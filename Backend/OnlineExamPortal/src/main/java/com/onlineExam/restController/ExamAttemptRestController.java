package com.onlineExam.restController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.onlineExam.entity.AttemptAnswer;
import com.onlineExam.entity.EvaluationDTO;
import com.onlineExam.entity.ExamAttempt;
import com.onlineExam.entity.ExamSubmissionDTO;
import com.onlineExam.repository.ExamAttemptRepository;
import com.onlineExam.repository.InstituteRepository;
import com.onlineExam.service.ExamAttemptService;


@RestController
@RequestMapping("/api/exam")
@CrossOrigin("*")
public class ExamAttemptRestController {
	
	@Autowired
    private ExamAttemptService examAttemptService;
	
	@Autowired
	private ExamAttemptRepository examAttemptRepo;

	@PostMapping("/submit")
    public ResponseEntity<?> submitExam(@RequestBody ExamSubmissionDTO submission) {
        try {
            ExamAttempt attempt = examAttemptService.processSubmission(submission);
            // return result and pass/fail
            Map<String, Object> resp = new HashMap<>();
            resp.put("totalMarks", attempt.getTotalMarks());
            resp.put("percentage", attempt.getPercentage());
            resp.put("result", attempt.getResult());
            resp.put("attemptId", attempt.getId());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
	
	@PostMapping("/evaluate-test/{testId}/{instituteName}")
    public ResponseEntity<?> evaluateTest(
            @PathVariable Long testId,
            @PathVariable String instituteName) {

        examAttemptService.evaluateTestAttempts(testId, instituteName);
        return ResponseEntity.ok("Evaluation Completed");
    }
	
	@GetMapping("/attempt/{id}")
	public ResponseEntity<?> getAttemptDetails(@PathVariable Long id) {
	    return ResponseEntity.ok(
	        examAttemptRepo.findById(id)
	            .orElseThrow(() -> new RuntimeException("Attempt not found"))
	    );
	}
	
	@GetMapping("/by-test/{testId}")
	public ResponseEntity<?> getAttemptsByTest(@PathVariable Long testId) {
	    List<ExamAttempt> list =
	            examAttemptRepo.findByTest_Id(testId);
	    return ResponseEntity.ok(list);
	}
	
	// Fetch My Institute Users Attempt Exams
	@GetMapping("/by-institute/{instituteName}")
    public List<ExamAttempt> getAttemptsByInstitute(
            @PathVariable String instituteName) {

        return examAttemptRepo.findByInstituteName(instituteName);
    }
	
	// ➤ Get Exam Attempt History by User Email
	@GetMapping("/history/{email}")
	public ResponseEntity<?> getAttemptsByEmail(@PathVariable String email) {
	    List<ExamAttempt> list = examAttemptRepo.findByUserEmail(email);
	    return ResponseEntity.ok(list);
	}
	
	// ➤ Get All Users Exam Attempts (Admin)
	@GetMapping("/all")
	public ResponseEntity<?> getAllAttempts() {
	    List<ExamAttempt> list = examAttemptRepo.findAll();
	    return ResponseEntity.ok(list);
	}
	
	
	@GetMapping("/check-attempt")
	public ResponseEntity<?> checkUserAttempt(
	        @RequestParam String userEmail,
	        @RequestParam Long testId) {

	    boolean attempted =
	            examAttemptRepo.existsByUserEmailAndTest_Id(userEmail, testId);
	    return ResponseEntity.ok(attempted);
	}
	
	@GetMapping("/check-attempt-exists")
	public ResponseEntity<?> checkAttempt(
	        @RequestParam Long testId,
	        @RequestParam String userEmail) {

	    Optional<ExamAttempt> attempt =
	            examAttemptRepo.findByUserEmailAndTest_Id(userEmail, testId);

	    if (attempt.isPresent()) {
	        return ResponseEntity.ok(attempt.get());
	    } else {
	        return ResponseEntity.ok(null);
	    }
	}

	@DeleteMapping("/delete/{id}/{instituteName}")
	public ResponseEntity<?> deleteAttempt(
	        @PathVariable Long id,
	        @PathVariable String instituteName) {

	    ExamAttempt attempt = examAttemptRepo
	            .findByIdAndInstituteName(id, instituteName)
	            .orElseThrow(() -> new RuntimeException("Attempt not found or unauthorized"));

	    examAttemptRepo.delete(attempt);

	    return ResponseEntity.ok("Exam attempt deleted successfully");
	}

}
