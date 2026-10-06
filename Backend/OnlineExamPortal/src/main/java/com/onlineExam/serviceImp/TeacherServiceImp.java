package com.onlineExam.serviceImp;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.onlineExam.entity.Teacher;
import com.onlineExam.repository.TeacherRepository;
import com.onlineExam.service.TeacherService;

@Service
public class TeacherServiceImp implements TeacherService{

	@Autowired
	private TeacherRepository teacherRepo;
	
	@Override
    public Teacher addTeacher(Teacher teacher) {
        if (teacherRepo.findByEmail(teacher.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists!");
        }
        return teacherRepo.save(teacher);
    }	
	@Override
	public Teacher loginTeacher(String email, String password) {
	    Teacher teacher = teacherRepo.findByEmail(email)
	            .orElseThrow(() -> new RuntimeException("Invalid Email"));
	    if (!teacher.getPassword().equals(password)) {
	        throw new RuntimeException("Invalid Password");
	    }
	    if (!"Active".equalsIgnoreCase(teacher.getStatus())) {
	        throw new RuntimeException("Your account is inactive");
	    }
	    return teacher;
	}

    @Override
    public List<Teacher> getAllTeachers() {
        return teacherRepo.findAll();
    }

    @Override
    public Teacher updateTeacher(Long id, Teacher teacher) {

        Teacher existing = teacherRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher Not Found"));

        existing.setTeacherName(teacher.getTeacherName());
        existing.setPhoneNo(teacher.getPhoneNo());
        existing.setPassword(teacher.getPassword());
        existing.setStatus(teacher.getStatus());

        return teacherRepo.save(existing);
    }

    @Override
    public void deleteTeacher(Long id) {
        teacherRepo.deleteById(id);
    }
}
