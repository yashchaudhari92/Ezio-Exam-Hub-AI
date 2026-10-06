package com.onlineExam.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;

@Entity
public class AttemptAnswer {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long questionId;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String questionText;
    private String option1;
    private String option2;
    private String option3;
    private String option4;
    private String correctAnswer;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String selectedAnswer;
    private boolean correct;
    private Double marksObtained;
    private Double maxMarks;
    
    @ManyToOne
    @JoinColumn(name = "exam_attempt_id")
    @JsonBackReference
    private ExamAttempt examAttempt;

	public Long getId() {
		return id;
	}

	public Long getQuestionId() {
		return questionId;
	}

	public String getQuestionText() {
		return questionText;
	}

	public String getOption1() {
		return option1;
	}

	public String getOption2() {
		return option2;
	}

	public String getOption3() {
		return option3;
	}

	public String getOption4() {
		return option4;
	}

	public String getCorrectAnswer() {
		return correctAnswer;
	}

	public String getSelectedAnswer() {
		return selectedAnswer;
	}

	public boolean isCorrect() {
		return correct;
	}

	public Double getMarksObtained() {
		return marksObtained;
	}

	public Double getMaxMarks() {
		return maxMarks;
	}

	public ExamAttempt getExamAttempt() {
		return examAttempt;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public void setQuestionId(Long questionId) {
		this.questionId = questionId;
	}

	public void setQuestionText(String questionText) {
		this.questionText = questionText;
	}

	public void setOption1(String option1) {
		this.option1 = option1;
	}

	public void setOption2(String option2) {
		this.option2 = option2;
	}

	public void setOption3(String option3) {
		this.option3 = option3;
	}

	public void setOption4(String option4) {
		this.option4 = option4;
	}

	public void setCorrectAnswer(String correctAnswer) {
		this.correctAnswer = correctAnswer;
	}

	public void setSelectedAnswer(String selectedAnswer) {
		this.selectedAnswer = selectedAnswer;
	}

	public void setCorrect(boolean correct) {
		this.correct = correct;
	}

	public void setMarksObtained(Double marksObtained) {
		this.marksObtained = marksObtained;
	}

	public void setMaxMarks(Double maxMarks) {
		this.maxMarks = maxMarks;
	}

	public void setExamAttempt(ExamAttempt examAttempt) {
		this.examAttempt = examAttempt;
	}

	@Override
	public String toString() {
		return "AttemptAnswer [id=" + id + ", questionId=" + questionId + ", questionText=" + questionText
				+ ", option1=" + option1 + ", option2=" + option2 + ", option3=" + option3 + ", option4=" + option4
				+ ", correctAnswer=" + correctAnswer + ", selectedAnswer=" + selectedAnswer + ", correct=" + correct
				+ ", marksObtained=" + marksObtained + ", maxMarks=" + maxMarks + ", examAttempt=" + examAttempt + "]";
	}

	public AttemptAnswer(Long id, Long questionId, String questionText, String option1, String option2, String option3,
			String option4, String correctAnswer, String selectedAnswer, boolean correct, Double marksObtained,
			Double maxMarks, ExamAttempt examAttempt) {
		super();
		this.id = id;
		this.questionId = questionId;
		this.questionText = questionText;
		this.option1 = option1;
		this.option2 = option2;
		this.option3 = option3;
		this.option4 = option4;
		this.correctAnswer = correctAnswer;
		this.selectedAnswer = selectedAnswer;
		this.correct = correct;
		this.marksObtained = marksObtained;
		this.maxMarks = maxMarks;
		this.examAttempt = examAttempt;
	}

	public AttemptAnswer() {
		super();
		// TODO Auto-generated constructor stub
	}

}
