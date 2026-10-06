package com.onlineExam.service;

import java.util.List;

import com.onlineExam.entity.Admin;


public interface AdminService {
	
	Admin addAdmin(Admin admin);
    List<Admin> getAllAdmins();
    
    Admin getAdmin(Long id);
    public Admin update(Long id, Admin updatedAdmin);
    
    void deleteAdmin(Long id);
    
    Admin login(String email, String password);
}
