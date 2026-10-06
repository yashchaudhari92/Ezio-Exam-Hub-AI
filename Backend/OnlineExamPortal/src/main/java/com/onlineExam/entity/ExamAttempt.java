package com.onlineExam.entity;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

@Entity
public class ExamAttempt {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userName;
    private String userEmail;
    private String instituteName;
    private Double totalMarks;
    private Double percentage;
    private String result;
    private LocalDateTime attemptedAt;
    private Integer tabSwitchCount;
//    Teacher
    private String checkedByName;
    private String checkedByEmail;
    private LocalDateTime checkedAt;
    @Column(nullable = false)
    private boolean evaluated = false;

    @ManyToOne
    @JoinColumn(name = "test_id")
    private Test test;
    @OneToMany(mappedBy = "examAttempt", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<AttemptAnswer> answers = new ArrayList<>();
	public Long getId() {
		return id;
	}
	public String getUserName() {
		return userName;
	}
	public String getUserEmail() {
		return userEmail;
	}
	public String getInstituteName() {
		return instituteName;
	}
	public Double getTotalMarks() {
		return totalMarks;
	}
	public Double getPercentage() {
		return percentage;
	}
	public String getResult() {
		return result;
	}
	public LocalDateTime getAttemptedAt() {
		return attemptedAt;
	}
	public Integer getTabSwitchCount() {
		return tabSwitchCount;
	}
	public String getCheckedByName() {
		return checkedByName;
	}
	public String getCheckedByEmail() {
		return checkedByEmail;
	}
	public LocalDateTime getCheckedAt() {
		return checkedAt;
	}
	public boolean isEvaluated() {
		return evaluated;
	}
	public Test getTest() {
		return test;
	}
	public List<AttemptAnswer> getAnswers() {
		return answers;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public void setUserEmail(String userEmail) {
		this.userEmail = userEmail;
	}
	public void setInstituteName(String instituteName) {
		this.instituteName = instituteName;
	}
	public void setTotalMarks(Double totalMarks) {
		this.totalMarks = totalMarks;
	}
	public void setPercentage(Double percentage) {
		this.percentage = percentage;
	}
	public void setResult(String result) {
		this.result = result;
	}
	public void setAttemptedAt(LocalDateTime attemptedAt) {
		this.attemptedAt = attemptedAt;
	}
	public void setTabSwitchCount(Integer tabSwitchCount) {
		this.tabSwitchCount = tabSwitchCount;
	}
	public void setCheckedByName(String checkedByName) {
		this.checkedByName = checkedByName;
	}
	public void setCheckedByEmail(String checkedByEmail) {
		this.checkedByEmail = checkedByEmail;
	}
	public void setCheckedAt(LocalDateTime checkedAt) {
		this.checkedAt = checkedAt;
	}
	public void setEvaluated(boolean evaluated) {
		this.evaluated = evaluated;
	}
	public void setTest(Test test) {
		this.test = test;
	}
	public void setAnswers(List<AttemptAnswer> answers) {
		this.answers = answers;
	}
	@Override
	public String toString() {
		return "ExamAttempt [id=" + id + ", userName=" + userName + ", userEmail=" + userEmail + ", instituteName="
				+ instituteName + ", totalMarks=" + totalMarks + ", percentage=" + percentage + ", result=" + result
				+ ", attemptedAt=" + attemptedAt + ", tabSwitchCount=" + tabSwitchCount + ", checkedByName="
				+ checkedByName + ", checkedByEmail=" + checkedByEmail + ", checkedAt=" + checkedAt + ", evaluated="
				+ evaluated + ", test=" + test + ", answers=" + answers + "]";
	}
	public ExamAttempt(Long id, String userName, String userEmail, String instituteName, Double totalMarks,
			Double percentage, String result, LocalDateTime attemptedAt, Integer tabSwitchCount, String checkedByName,
			String checkedByEmail, LocalDateTime checkedAt, boolean evaluated, Test test, List<AttemptAnswer> answers) {
		super();
		this.id = id;
		this.userName = userName;
		this.userEmail = userEmail;
		this.instituteName = instituteName;
		this.totalMarks = totalMarks;
		this.percentage = percentage;
		this.result = result;
		this.attemptedAt = attemptedAt;
		this.tabSwitchCount = tabSwitchCount;
		this.checkedByName = checkedByName;
		this.checkedByEmail = checkedByEmail;
		this.checkedAt = checkedAt;
		this.evaluated = evaluated;
		this.test = test;
		this.answers = answers;
	}
	public ExamAttempt() {
		super();
		// TODO Auto-generated constructor stub
	}
    
}
