package com.onlineExam.serviceImp;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.multipart.MultipartFile;

import com.onlineExam.entity.ExamAttempt;
import com.onlineExam.entity.Questions;
import com.onlineExam.entity.Test;
import com.onlineExam.repository.AttemptAnswerRepository;
import com.onlineExam.repository.ExamAttemptRepository;
import com.onlineExam.repository.QuestionsRepository;
import com.onlineExam.repository.TestRepository;
import com.onlineExam.service.TestService;

import jakarta.transaction.Transactional;

@Service
public class TestServiceImp implements TestService {

	@Autowired
	private TestRepository testRepo;
	
	@Autowired
    private QuestionsRepository questionsRepo;
	
	@Autowired
	private GeminiService geminiService;
	@Autowired
	private ExamAttemptRepository examAttemptRepo;

	@Autowired
	private AttemptAnswerRepository attemptAnswerRepo;
	

    @Override
    public Test saveTestData(String institude, String institudeEmail, String topicName, String examType, String language,
                             String duration, String testTotalQuestion, String testTotalMarks, String passingMarks, String resultTime, MultipartFile file) throws Exception {
        String fileName = file.getOriginalFilename();
        Test test = new Test();
        test.setInstitude(institude);
        test.setInstitudeEmail(institudeEmail);
        test.setTopicName(topicName);
        test.setExamType(examType);
        test.setLanguage(language);
        test.setDuration(duration);
        test.setTestTotalQuestion(testTotalQuestion);
        test.setTestTotalMarks(testTotalMarks);
        test.setPassingMarks(passingMarks);
        test.setResultTime(resultTime);
//        test.setNote(note);
        test.setQuetionsFile(fileName);
        Test savedTest = testRepo.save(test);
        readExcelQuestions(file, savedTest);
        return savedTest;
    }
    
    private void readExcelQuestions(MultipartFile file, Test savedTest) throws Exception {
        XSSFWorkbook workbook = new XSSFWorkbook(file.getInputStream());
        XSSFSheet sheet = workbook.getSheetAt(0);
        int rowCount = sheet.getPhysicalNumberOfRows();
        for (int i = 1; i < rowCount; i++) {
            XSSFRow row = sheet.getRow(i);
            if (row == null) continue;
            Questions q = new Questions();
            q.setQueNum(getIntCellValue(row.getCell(1)));
            if (savedTest.getExamType().equalsIgnoreCase("MCQ")) {

                q.setQuestions(getStringCellValue(row.getCell(2)).trim());
                q.setMarks(getDoubleCellValue(row.getCell(3)));
                q.setOption1("");
                q.setOption2("");
                q.setOption3("");
                q.setOption4("");
                q.setAnswer("");
            }
            else { 
            	// THEORY EXAM
                q.setQuestions(getStringCellValue(row.getCell(2)).trim());
                q.setMarks(getDoubleCellValue(row.getCell(3)));
                q.setOption1("");
                q.setOption2("");
                q.setOption3("");
                q.setOption4("");
                q.setAnswer("");
            }
            q.setTest(savedTest);
            questionsRepo.save(q);
        }
        workbook.close();
    }
    private Double getDoubleCellValue(Cell cell) {
        if (cell == null) return 0.0;
        switch (cell.getCellType()) {
            case NUMERIC:
                return cell.getNumericCellValue();
            case STRING:
                try {
                    return Double.parseDouble(cell.getStringCellValue().trim());
                } catch (Exception e) {
                    return 0.0;
                }
            default:
                return 0.0;
        }
    }    
    private String getStringCellValue(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                return String.valueOf((int) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }    
    private Integer getIntCellValue(Cell cell) {
        if (cell == null) return 0;

        switch (cell.getCellType()) {
            case NUMERIC:
                return (int) cell.getNumericCellValue();
            case STRING:
                try {
                    return Integer.parseInt(cell.getStringCellValue().trim());
                } catch (Exception e) {
                    return 0;
                }
            default:
                return 0;
        }
    }
    
    @Override
    public List<Test> getTestsByInstitute(String institude) {
        return testRepo.findByInstitude(institude);
    }

//    Fetch all Tests
    @Override
    public List<Test> getAllTests() {
        return testRepo.findAll();
    }
    @Override
    public List<Test> getTestsByInstituteAndLanguage(String institude, String language) {
//        return testRepo.findByInstitudeAndLanguage(institude, language);
        return testRepo.findByInstitudeAndLanguageAndStatus(institude, language, "APPROVED");
    }
    
    @Override
    public Test getTestById(Long id) {
        return testRepo.findById(id).orElse(null);
    }
    
    @Override
    public Test updateTest(Long id, String institude, String topicName, String examType, String language,
                           String duration, String testTotalQuestion, String testTotalMarks, String passingMarks, String resultTime, MultipartFile file) throws Exception {

        Test t = testRepo.findById(id)
                .orElseThrow(() -> new Exception("Test Not Found"));
        t.setInstitude(institude);
        t.setTopicName(topicName);
        t.setExamType(examType);
        t.setLanguage(language);
        t.setDuration(duration);
        t.setTestTotalQuestion(testTotalQuestion);
        t.setTestTotalMarks(testTotalMarks);
        t.setPassingMarks(passingMarks);
        t.setResultTime(resultTime);
//        t.setNote(note);
        if (file != null && !file.isEmpty()) {
            String fileName = file.getOriginalFilename();
            t.setQuetionsFile(fileName);
            List<Questions> oldQuestions = questionsRepo.findByTestId(id);
            questionsRepo.deleteAll(oldQuestions);
            readExcelQuestions(file, t);
        }
        return testRepo.save(t);
    }
    
    @Override
    @Transactional
    public void deleteTestById(Long testId) throws Exception {

        if (!testRepo.existsById(testId)) {
            throw new Exception("Test not found with ID: " + testId);
        }
        List<ExamAttempt> attempts = examAttemptRepo.findByTest_Id(testId);
        for (ExamAttempt attempt : attempts) {
            attemptAnswerRepo.deleteByExamAttemptId(attempt.getId());
        }
        examAttemptRepo.deleteAll(attempts);
        questionsRepo.deleteAll(questionsRepo.findByTestId(testId));
        testRepo.deleteById(testId);
    }

    @Override
    @Transactional
    public void approveInstituteTest(Long testId, String instituteEmail) {

        Test test = testRepo.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found"));

        if (instituteEmail == null
                || test.getInstitudeEmail() == null
                || !test.getInstitudeEmail().equalsIgnoreCase(instituteEmail.trim())) {
            throw new RuntimeException("You cannot approve another institute's test");
        }

        if (!"PENDING".equalsIgnoreCase(test.getStatus())) {
            throw new RuntimeException("Only pending tests can be approved");
        }

        List<Questions> mcqQuestions = new ArrayList<>();

        if ("MCQ".equalsIgnoreCase(test.getExamType())) {
            mcqQuestions.addAll(test.getQuestions());
        }

        if (!mcqQuestions.isEmpty()) {
            Map<Long, Map<String, String>> aiResponse =
                    geminiService.generateBulkMCQ(mcqQuestions);

            for (Questions q : mcqQuestions) {
                Map<String, String> data =
                        aiResponse == null ? null : aiResponse.get(q.getQueId());

                if (data == null) {
                    throw new RuntimeException(
                            "Could not generate MCQ options for question ID: " + q.getQueId());
                }

                List<String> options = new ArrayList<>();
                options.add(data.get("option1"));
                options.add(data.get("option2"));
                options.add(data.get("option3"));
                options.add(data.get("option4"));

                if (options.stream().anyMatch(option -> option == null || option.isBlank())) {
                    throw new RuntimeException(
                            "Generated MCQ options are incomplete for question ID: " + q.getQueId());
                }

                String correctAnswer = data.get("answer");

                if (correctAnswer == null || correctAnswer.isBlank()) {
                    throw new RuntimeException(
                            "Generated correct answer is missing for question ID: " + q.getQueId());
                }

                Collections.shuffle(options);

                q.setOption1(options.get(0));
                q.setOption2(options.get(1));
                q.setOption3(options.get(2));
                q.setOption4(options.get(3));
                q.setAnswer(correctAnswer);

                if (q.getMarks() == null) {
                    q.setMarks(1.0);
                }
            }

            questionsRepo.saveAll(mcqQuestions);
        }

        test.setStatus("APPROVED");
        testRepo.save(test);
    }
}
