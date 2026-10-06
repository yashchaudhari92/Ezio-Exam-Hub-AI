package com.onlineExam.restController;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import com.onlineExam.entity.Questions;
import com.onlineExam.entity.Test;
import com.onlineExam.repository.QuestionsRepository;
import com.onlineExam.repository.TestRepository;
import com.onlineExam.service.TestService;

@RestController
@RequestMapping("/api/test")
@CrossOrigin("*")
public class TestRestController {

	@Autowired
	private TestService testService;
	
	@Autowired
	private QuestionsRepository qRepo;
	
	@PostMapping( value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE
		)
    public ResponseEntity<?> addTest(
            @RequestParam("institude") String institude,
            @RequestParam("topicName") String topicName,
            @RequestParam("examType") String examType,
            @RequestParam("institudeEmail") String institudeEmail,
            @RequestParam("language") String language,
            @RequestParam("duration") String duration,
            @RequestParam("testTotalQuestion") String testTotalQuestion,
            @RequestParam("testTotalMarks") String testTotalMarks,
            @RequestParam("passingMarks") String passingMarks,
            @RequestParam("resultTime") String resultTime,
//            @RequestParam("note") String note,
            @RequestParam("quetionsFile") MultipartFile quetionsFile
    ) {
        try {
            Test savedTest = testService.saveTestData(
                    institude, institudeEmail, topicName, examType, language, duration, testTotalQuestion, testTotalMarks, passingMarks, resultTime, quetionsFile);
            return ResponseEntity.ok(savedTest);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
	
	@GetMapping("/all")
	public List<Map<String, Object>> getAllTests() {
	    List<Test> tests = testService.getAllTests();
	    List<Map<String, Object>> response = new ArrayList<>();
	    for (Test t : tests) {
	        Map<String, Object> map = new HashMap<>();
	        map.put("id", t.getId());
	        map.put("institude", t.getInstitude());
	        map.put("institudeEmail", t.getInstitudeEmail());
	        map.put("topicName", t.getTopicName());
	        map.put("examType", t.getExamType());
	        map.put("language", t.getLanguage());
	        map.put("duration", t.getDuration());
	        map.put("testTotalQuestion", t.getTestTotalQuestion());
	        map.put("testTotalMarks", t.getTestTotalMarks());
	        map.put("passingMarks", t.getPassingMarks());
	        map.put("resultTime", t.getResultTime());
//	        map.put("note", t.getNote());
	        map.put("status", t.getStatus());
	        response.add(map);
	    }
	    return response;
	}
	
	@PostMapping("/approve-all")
	public ResponseEntity<?> approveAllTests() {
	    testService.approveAllPendingTests();
	    return ResponseEntity.ok("All tests approved!");
	}
	
	@PostMapping("/approve-selected")
	public ResponseEntity<?> approveSelectedTests(@RequestBody List<Long> testIds) {
	    testService.approveSelectedTests(testIds);
	    return ResponseEntity.ok("Selected tests approved!");
	}
	
	@GetMapping("/by-institute/{institude}")
	public List<Map<String, Object>> getTestsByInstitute(@PathVariable String institude) {

	    List<Test> tests = testService.getTestsByInstitute(institude);
	    List<Map<String, Object>> response = new ArrayList<>();

	    for (Test t : tests) {
	        Map<String, Object> map = new HashMap<>();
	        map.put("id", t.getId());
	        map.put("institude", t.getInstitude());
	        map.put("topicName", t.getTopicName());
	        map.put("examType", t.getExamType());
	        map.put("language", t.getLanguage());
	        map.put("duration", t.getDuration());
	        map.put("testTotalQuestion", t.getTestTotalQuestion());
	        map.put("testTotalMarks", t.getTestTotalMarks());
	        map.put("passingMarks", t.getPassingMarks());
	        map.put("resultTime", t.getResultTime());
//	        map.put("note", t.getNote());
	        map.put("status", t.getStatus());
	        response.add(map);
	    }
	    return response;
	}
	
//  Get Quetion Id
  @GetMapping("/questions/{testId}")
  public List<Questions> getQuestionsByTest(@PathVariable Long testId) {
      return qRepo.findByTestId(testId);
  }  
  // Language Select Related Test Fetch
  @GetMapping("/by-institute-language")
  public ResponseEntity<?> getTestsByInstituteAndLanguage(
          @RequestParam String institute,
          @RequestParam String language) {

      return ResponseEntity.ok(
              testService.getTestsByInstituteAndLanguage(institute, language)
      );
  }

  
  // Exam page Get Test id Data
  @GetMapping("/{id}")
  public ResponseEntity<?> getTestById(@PathVariable Long id) {
      Test test = testService.getTestById(id);
      if (test != null) {
          return ResponseEntity.ok(test);
      } else {
          return ResponseEntity.status(404).body("Test Not Found");
      }
  }
  
//  Update Test
  @PutMapping("/update/{id}")
  public ResponseEntity<?> updateTest(
          @PathVariable Long id,
          @RequestParam("institude") String institude,
          @RequestParam("topicName") String topicName,
          @RequestParam("examType") String examType,
          @RequestParam("language") String language,
          @RequestParam("duration") String duration,
          @RequestParam("testTotalQuestion") String testTotalQuestion,
          @RequestParam("testTotalMarks") String testTotalMarks,
          @RequestParam("passingMarks") String passingMarks,
          @RequestParam("resultTime") String resultTime,
//          @RequestParam("note") String note,
          @RequestParam(value = "quetionsFile", required = false) MultipartFile quetionsFile
  ) {
      try {
          Test updated = testService.updateTest(id, institude, topicName, examType, language, duration, testTotalQuestion, testTotalMarks, passingMarks, resultTime, quetionsFile);
          return ResponseEntity.ok(updated);
      } catch (Exception e) {
          return ResponseEntity.status(500).body("Error: " + e.getMessage());
      }
  }

  // Delete Functionality
  @DeleteMapping("/delete/{testId}")
  public ResponseEntity<?> deleteTest(@PathVariable Long testId) {
      try {
          testService.deleteTestById(testId);
          return ResponseEntity.ok("Test deleted successfully!");
      } catch (Exception e) {
          return ResponseEntity.status(500).body("Error: " + e.getMessage());
      }
  }
}
