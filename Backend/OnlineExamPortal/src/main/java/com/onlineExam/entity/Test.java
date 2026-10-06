package com.onlineExam.entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;

@Entity
public class Test {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String institude;
	private String institudeEmail;
	private String topicName;
	private String examType;
	private String language;
	private String duration;
	private String testTotalQuestion;
	private String testTotalMarks;
    private String passingMarks;
	private String resultTime;
	@Lob
    @Column(columnDefinition = "LONGTEXT")
	private String note;
	private String quetionsFile;
	
	private String status = "PENDING"; 
	
	@OneToMany(mappedBy = "test", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Questions> questions = new ArrayList<>();

	@JsonIgnore
	@OneToMany(mappedBy = "test", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ExamAttempt> examAttempts = new ArrayList<>();

	public Long getId() {
		return id;
	}

	public String getInstitude() {
		return institude;
	}

	public String getInstitudeEmail() {
		return institudeEmail;
	}

	public String getTopicName() {
		return topicName;
	}

	public String getExamType() {
		return examType;
	}

	public String getLanguage() {
		return language;
	}

	public String getDuration() {
		return duration;
	}

	public String getTestTotalQuestion() {
		return testTotalQuestion;
	}

	public String getTestTotalMarks() {
		return testTotalMarks;
	}

	public String getPassingMarks() {
		return passingMarks;
	}

	public String getResultTime() {
		return resultTime;
	}

	public String getNote() {
		return note;
	}

	public String getQuetionsFile() {
		return quetionsFile;
	}

	public String getStatus() {
		return status;
	}

	public List<Questions> getQuestions() {
		return questions;
	}

	public List<ExamAttempt> getExamAttempts() {
		return examAttempts;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public void setInstitude(String institude) {
		this.institude = institude;
	}

	public void setInstitudeEmail(String institudeEmail) {
		this.institudeEmail = institudeEmail;
	}

	public void setTopicName(String topicName) {
		this.topicName = topicName;
	}

	public void setExamType(String examType) {
		this.examType = examType;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public void setDuration(String duration) {
		this.duration = duration;
	}

	public void setTestTotalQuestion(String testTotalQuestion) {
		this.testTotalQuestion = testTotalQuestion;
	}

	public void setTestTotalMarks(String testTotalMarks) {
		this.testTotalMarks = testTotalMarks;
	}

	public void setPassingMarks(String passingMarks) {
		this.passingMarks = passingMarks;
	}

	public void setResultTime(String resultTime) {
		this.resultTime = resultTime;
	}

	public void setNote(String note) {
		this.note = note;
	}

	public void setQuetionsFile(String quetionsFile) {
		this.quetionsFile = quetionsFile;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public void setQuestions(List<Questions> questions) {
		this.questions = questions;
	}

	public void setExamAttempts(List<ExamAttempt> examAttempts) {
		this.examAttempts = examAttempts;
	}

	@Override
	public String toString() {
		return "Test [id=" + id + ", institude=" + institude + ", institudeEmail=" + institudeEmail + ", topicName="
				+ topicName + ", examType=" + examType + ", language=" + language + ", duration=" + duration
				+ ", testTotalQuestion=" + testTotalQuestion + ", testTotalMarks=" + testTotalMarks + ", passingMarks="
				+ passingMarks + ", resultTime=" + resultTime + ", note=" + note + ", quetionsFile=" + quetionsFile
				+ ", status=" + status + ", questions=" + questions + ", examAttempts=" + examAttempts + "]";
	}

	public Test(Long id, String institude, String institudeEmail, String topicName, String examType, String language,
			String duration, String testTotalQuestion, String testTotalMarks, String passingMarks, String resultTime,
			String note, String quetionsFile, String status, List<Questions> questions,
			List<ExamAttempt> examAttempts) {
		super();
		this.id = id;
		this.institude = institude;
		this.institudeEmail = institudeEmail;
		this.topicName = topicName;
		this.examType = examType;
		this.language = language;
		this.duration = duration;
		this.testTotalQuestion = testTotalQuestion;
		this.testTotalMarks = testTotalMarks;
		this.passingMarks = passingMarks;
		this.resultTime = resultTime;
		this.note = note;
		this.quetionsFile = quetionsFile;
		this.status = status;
		this.questions = questions;
		this.examAttempts = examAttempts;
	}

	public Test() {
		super();
		// TODO Auto-generated constructor stub
	}
	
}
