package com.onlineExam.entity;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import com.onlineExam.entity.Test;

@Entity
public class Questions {

	@Id
	 @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long queId;

	 	private Integer queNum;	 	
	    private String questions;
	    private String option1;
	    private String option2;
	    private String option3;
	    private String option4;
	    private String answer;
//	    private Integer marks;
	    private Double marks;
	    
	    @ManyToOne
	    @JoinColumn(name = "id")
	    @JsonBackReference
	    private Test test;

		public Long getQueId() {
			return queId;
		}

		public Integer getQueNum() {
			return queNum;
		}

		public String getQuestions() {
			return questions;
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

		public String getAnswer() {
			return answer;
		}

		public Double getMarks() {
			return marks;
		}

		public Test getTest() {
			return test;
		}

		public void setQueId(Long queId) {
			this.queId = queId;
		}

		public void setQueNum(Integer queNum) {
			this.queNum = queNum;
		}

		public void setQuestions(String questions) {
			this.questions = questions;
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

		public void setAnswer(String answer) {
			this.answer = answer;
		}

		public void setMarks(Double marks) {
			this.marks = marks;
		}

		public void setTest(Test test) {
			this.test = test;
		}

		@Override
		public String toString() {
			return "Questions [queId=" + queId + ", queNum=" + queNum + ", questions=" + questions + ", option1="
					+ option1 + ", option2=" + option2 + ", option3=" + option3 + ", option4=" + option4 + ", answer="
					+ answer + ", marks=" + marks + ", test=" + test + "]";
		}

		public Questions(Long queId, Integer queNum, String questions, String option1, String option2, String option3,
				String option4, String answer, Double marks, Test test) {
			super();
			this.queId = queId;
			this.queNum = queNum;
			this.questions = questions;
			this.option1 = option1;
			this.option2 = option2;
			this.option3 = option3;
			this.option4 = option4;
			this.answer = answer;
			this.marks = marks;
			this.test = test;
		}

		public Questions() {
			super();
			// TODO Auto-generated constructor stub
		}
	   
}
