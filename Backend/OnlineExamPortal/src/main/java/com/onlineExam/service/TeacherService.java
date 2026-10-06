package com.onlineExam.service;

import java.util.List;

import com.onlineExam.entity.Teacher;

public interface TeacherService {
	
	Teacher addTeacher(Teacher teacher);
	Teacher loginTeacher(String email, String password);
    List<Teacher> getAllTeachers();
    Teacher updateTeacher(Long id, Teacher teacher);

    void deleteTeacher(Long id);
}
