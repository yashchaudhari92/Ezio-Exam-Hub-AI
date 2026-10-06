package com.onlineExam.restController;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.onlineExam.entity.Teacher;
import com.onlineExam.service.TeacherService;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin("*")
public class TeacherRestController {

	@Autowired
	private TeacherService teacherService;
	
	@PostMapping("/add")
    public ResponseEntity<?> addTeacher(@RequestBody Teacher teacher) {
        try {
            Teacher saved = teacherService.addTeacher(teacher);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
	
	@PostMapping("/login")
	public ResponseEntity<?> loginTeacher(@RequestBody Teacher teacher) {
	    try {
	        Teacher loggedTeacher =
	                teacherService.loginTeacher(teacher.getEmail(), teacher.getPassword());
	        return ResponseEntity.ok(loggedTeacher);
	    } catch (Exception e) {
	        return ResponseEntity.badRequest().body(e.getMessage());
	    }
	}

    @GetMapping("/all")
    public ResponseEntity<List<Teacher>> getAllTeachers() {
        return ResponseEntity.ok(teacherService.getAllTeachers());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateTeacher(@PathVariable Long id,
                                           @RequestBody Teacher teacher) {
        try {
            Teacher updated = teacherService.updateTeacher(id, teacher);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteTeacher(@PathVariable Long id) {
        teacherService.deleteTeacher(id);
        return ResponseEntity.ok("Teacher Deleted Successfully");
    }
	
}
