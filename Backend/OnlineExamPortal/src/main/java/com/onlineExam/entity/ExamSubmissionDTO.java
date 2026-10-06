package com.onlineExam.entity;

import java.util.Map;

public class ExamSubmissionDTO {
	private Long testId;
    private String userName;
    private String userEmail;
    private String instituteName;
    private Integer tabSwitchCount;
    
    // Map of questionId -> selectedOption (string)
//    private Map<Long, String> answers;
    private Map<String, String> answers;
	public Long getTestId() {
		return testId;
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
	public Integer getTabSwitchCount() {
		return tabSwitchCount;
	}
	public Map<String, String> getAnswers() {
		return answers;
	}
	public void setTestId(Long testId) {
		this.testId = testId;
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
	public void setTabSwitchCount(Integer tabSwitchCount) {
		this.tabSwitchCount = tabSwitchCount;
	}
	public void setAnswers(Map<String, String> answers) {
		this.answers = answers;
	}
	@Override
	public String toString() {
		return "ExamSubmissionDTO [testId=" + testId + ", userName=" + userName + ", userEmail=" + userEmail
				+ ", instituteName=" + instituteName + ", tabSwitchCount=" + tabSwitchCount + ", answers=" + answers
				+ "]";
	}
	public ExamSubmissionDTO(Long testId, String userName, String userEmail, String instituteName,
			Integer tabSwitchCount, Map<String, String> answers) {
		super();
		this.testId = testId;
		this.userName = userName;
		this.userEmail = userEmail;
		this.instituteName = instituteName;
		this.tabSwitchCount = tabSwitchCount;
		this.answers = answers;
	}
	public ExamSubmissionDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
}
