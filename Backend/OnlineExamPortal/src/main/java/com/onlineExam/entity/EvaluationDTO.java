//package com.onlineExam.entity;
//
//import lombok.Data;
//import java.util.Map;
//
//@Data
//public class EvaluationDTO {
//
//	private Map<Long, Double> marks;
//    private String teacherName;
//    private String teacherEmail;
//}
package com.onlineExam.entity;

import java.util.Map;

public class EvaluationDTO {

    private Map<Long, Double> marks;
    private String teacherName;
    private String teacherEmail;

    // Getter and Setter for marks
    public Map<Long, Double> getMarks() {
        return marks;
    }

    public void setMarks(Map<Long, Double> marks) {
        this.marks = marks;
    }

    // Getter and Setter for teacherName
    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    // Getter and Setter for teacherEmail
    public String getTeacherEmail() {
        return teacherEmail;
    }

    public void setTeacherEmail(String teacherEmail) {
        this.teacherEmail = teacherEmail;
    }
}