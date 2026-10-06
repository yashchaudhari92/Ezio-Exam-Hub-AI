package com.onlineExam.service;

import java.util.List;

import com.onlineExam.entity.User;

public interface UserService {
	User register(User user);
	List<User> getAllUsers();
	void deleteUser(Long id);
}
