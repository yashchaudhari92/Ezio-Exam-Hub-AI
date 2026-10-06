package com.onlineExam.serviceImp;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.onlineExam.entity.ExamAttempt;
import com.onlineExam.entity.User;
import com.onlineExam.repository.AttemptAnswerRepository;
import com.onlineExam.repository.ExamAttemptRepository;
import com.onlineExam.repository.UserRepository;
import com.onlineExam.service.UserService;

@Service
public class UserServiceImp implements UserService{

	@Autowired
	private UserRepository userRepo;
	
	@Autowired
    private AttemptAnswerRepository attemptAnswerRepo;
	
	@Autowired
    private ExamAttemptRepository examAttemptRepo;
	
	@Override
    public User register(User user) {
        return userRepo.save(user);
    }	
	
	@Override
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }
	
	@Override
	@Transactional
	public void deleteUser(Long id) {

	    User user = userRepo.findById(id).orElse(null);

	    if (user != null) {

	        String email = user.getEmail();

	        // 1️⃣ Get all exam attempts
	        List<ExamAttempt> attempts = examAttemptRepo.findByUserEmail(email);

	        // 2️⃣ Delete attempt answers (child)
	        for (ExamAttempt attempt : attempts) {
	            attemptAnswerRepo.deleteByExamAttemptId(attempt.getId());
	        }

	        // 3️⃣ Delete exam attempts
	        examAttemptRepo.deleteAll(attempts);

	        // 4️⃣ Delete user
	        userRepo.deleteById(id);
	    }
	}
}
