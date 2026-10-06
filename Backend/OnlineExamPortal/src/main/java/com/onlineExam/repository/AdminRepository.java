package com.onlineExam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.onlineExam.entity.Admin;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long>{
	
	 Admin findByEmailAndPassword(String email, String password);
}
