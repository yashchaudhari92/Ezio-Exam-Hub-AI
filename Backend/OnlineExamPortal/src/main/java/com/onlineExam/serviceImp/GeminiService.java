package com.onlineExam.serviceImp;

import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import com.onlineExam.entity.Questions;

import org.springframework.http.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import org.springframework.beans.factory.annotation.Value;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private static final String GEMINI_URL =
    		"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=";
   
    private RestTemplate restTemplate = new RestTemplate();

    public Map<Long, Map<Long, Double>> evaluateAllStudents(List<Map<String, Object>> studentsData) {

        try {
            StringBuilder prompt = new StringBuilder();

            prompt.append("""
    You are a STRICT exam evaluator.

    IMPORTANT RULES:
    - Marks must be given strictly based on answer quality and length.
    - DO NOT give full marks for short answers.
    - Compare student answer with question demand.
    - Use the maxMarks as upper limit.

    MARKING LOGIC:
    - 0% content → 0 marks
    - 25% relevant → 25% marks
    - 50% relevant → 50% marks
    - 75% relevant → 75% marks
    - 100% complete → full marks

    STRICT CONDITIONS:
    - Short answer for 5 marks question → MAX 2 or 3 marks
    - Medium answer → partial marks
    - Detailed, correct answer → full marks
    - Irrelevant or wrong → 0

    RETURN ONLY JSON (NO TEXT, NO EXPLANATION)

    FORMAT:
    {
      "attemptId": {
        "questionId": marks
      }
    }

    DATA:
    """);

            // 🔥 Add student data
            for (Map<String, Object> student : studentsData) {
                prompt.append("\nAttemptId: ").append(student.get("attemptId")).append("\n");

                List<Map<String, Object>> answers =
                        (List<Map<String, Object>>) student.get("answers");

                for (Map<String, Object> ans : answers) {
                    prompt.append("QuestionId: ").append(ans.get("questionId")).append("\n");
                    prompt.append("Question: ").append(ans.get("question")).append("\n");
                    prompt.append("MaxMarks: ").append(ans.get("maxMarks")).append("\n");
                    prompt.append("StudentAnswer: ").append(ans.get("studentAnswer")).append("\n\n");
                }
            }

            // ================= API CALL =================
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt.toString());

            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request =
                    new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = callGeminiWithRetry(request);
            
            Map body = response.getBody();

            List candidates = (List) body.get("candidates");
            Map candidate = (Map) candidates.get(0);
            Map con = (Map) candidate.get("content");
            List parts = (List) con.get("parts");

            String aiText = ((Map) parts.get(0)).get("text").toString();

            // साफ JSON निकालना
            aiText = aiText.replace("```json", "").replace("```", "").trim();

            int start = aiText.indexOf("{");
            int end = aiText.lastIndexOf("}");

            if (start == -1 || end == -1) {
                throw new RuntimeException("Invalid AI JSON");
            }

            String json = aiText.substring(start, end + 1);

            ObjectMapper mapper = new ObjectMapper();

            Map<String, Map<String, Double>> temp =
                    mapper.readValue(json, new TypeReference<Map<String, Map<String, Double>>>() {});

            Map<Long, Map<Long, Double>> result = new HashMap<>();

            for (Map.Entry<String, Map<String, Double>> entry : temp.entrySet()) {
                Long attemptId = Long.parseLong(entry.getKey());

                Map<Long, Double> questionMap = new HashMap<>();

                for (Map.Entry<String, Double> q : entry.getValue().entrySet()) {
                    questionMap.put(Long.parseLong(q.getKey()), q.getValue());
                }

                result.put(attemptId, questionMap);
            }

            return result;

        } catch (Exception e) {
            System.out.println("❌ AI ERROR: " + e.getMessage());
            return fallbackMarks(studentsData);
        }
    }
    
    private ResponseEntity<Map> callGeminiWithRetry(HttpEntity<Map<String, Object>> request) {

        int maxRetries = 3;
        int delay = 2000; // 2 sec

        for (int i = 1; i <= maxRetries; i++) {
            try {
                return restTemplate.postForEntity(
                        GEMINI_URL + apiKey,
                        request,
                        Map.class
                );
            } catch (Exception e) {

                System.out.println("⚠️ Retry " + i + " failed: " + e.getMessage());

                if (i == maxRetries) {
                    throw new RuntimeException("Gemini API Failed after retries");
                }

                try {
                    Thread.sleep(delay * i); // exponential delay
                } catch (InterruptedException ignored) {}
            }
        }
        return null;
    }
    
    private Map<Long, Map<Long, Double>> fallbackMarks(List<Map<String, Object>> data) {

        Map<Long, Map<Long, Double>> result = new HashMap<>();

        for (Map<String, Object> student : data) {

            Long attemptId = Long.parseLong(student.get("attemptId").toString());

            Map<Long, Double> marks = new HashMap<>();

            List<Map<String, Object>> answers =
                    (List<Map<String, Object>>) student.get("answers");

            for (Map<String, Object> ans : answers) {

                Long qId = Long.parseLong(ans.get("questionId").toString());

                String answer = (String) ans.get("studentAnswer");
                double maxMarks = Double.parseDouble(ans.get("maxMarks").toString());

                double score = 0.0;

                if (answer != null) {
                    int len = answer.length();

                    if (len > 100) score = maxMarks;
                    else if (len > 50) score = maxMarks * 0.7;
                    else if (len > 20) score = maxMarks * 0.4;
                    else score = maxMarks * 0.2;
                }

                marks.put(qId, score);
            }

            result.put(attemptId, marks);
        }

        return result;
    }


//  MCQ Generete Proper Working - 09/04/2026 Start
    
    public Map<Long, Map<String, String>> generateBulkMCQ(List<Questions> questions) {

        try {

            StringBuilder prompt = new StringBuilder();

            prompt.append("Generate MCQ options for each question.\n");
            prompt.append("Return STRICT JSON only.\n\n");

            prompt.append("FORMAT:\n");
            prompt.append("{\n");
            prompt.append("  \"questionId\": {\n");
            prompt.append("    \"option1\": \"...\",\n");
            prompt.append("    \"option2\": \"...\",\n");
            prompt.append("    \"option3\": \"...\",\n");
            prompt.append("    \"option4\": \"...\",\n");
            prompt.append("    \"answer\": \"correct option text\"\n");
            prompt.append("  }\n");
            prompt.append("}\n\n");

            for (Questions q : questions) {
                prompt.append("QID: ").append(q.getQueId()).append("\n");
                prompt.append("Question: ").append(q.getQuestions()).append("\n\n");
            }

            // 🔥 CALL GEMINI
            String aiResponse = callGeminiAPI(prompt.toString());

            // 🔥 CLEAN RESPONSE
            aiResponse = aiResponse.replace("```json", "")
                                   .replace("```", "")
                                   .trim();

            int start = aiResponse.indexOf("{");
            int end = aiResponse.lastIndexOf("}");
            String json = aiResponse.substring(start, end + 1);

            ObjectMapper mapper = new ObjectMapper();

            // 🔥 FIXED TYPE (IMPORTANT)
            Map<String, Map<String, String>> temp =
                    mapper.readValue(json, new TypeReference<Map<String, Map<String, String>>>() {});

            Map<Long, Map<String, String>> result = new HashMap<>();

            for (Map.Entry<String, Map<String, String>> entry : temp.entrySet()) {
                result.put(Long.parseLong(entry.getKey()), entry.getValue());
            }

            return result;

        } catch (Exception e) {
            System.out.println("MCQ BULK ERROR: " + e.getMessage());
            return new HashMap<>();
        }
    }
    
    private String callGeminiAPI(String prompt) {

        try {

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request =
                    new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response =
                    restTemplate.postForEntity(GEMINI_URL + apiKey, request, Map.class);

            Map body = response.getBody();

            List candidates = (List) body.get("candidates");
            Map candidate = (Map) candidates.get(0);
            Map con = (Map) candidate.get("content");
            List parts = (List) con.get("parts");

            return ((Map) parts.get(0)).get("text").toString();

        } catch (Exception e) {
            System.out.println("API ERROR: " + e.getMessage());
            return "";
        }
    }
    
}