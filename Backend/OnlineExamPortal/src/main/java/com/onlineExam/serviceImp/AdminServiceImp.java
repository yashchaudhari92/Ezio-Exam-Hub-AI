package com.onlineExam.serviceImp;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.onlineExam.entity.Admin;
import com.onlineExam.repository.AdminRepository;
import com.onlineExam.service.AdminService;

@Service
public class AdminServiceImp implements AdminService{

	@Autowired
	private AdminRepository adminRepo;
	
	@Override
    public Admin addAdmin(Admin admin) {
        return adminRepo.save(admin);
    }

    @Override
    public List<Admin> getAllAdmins() {
        return adminRepo.findAll();
    }
    
    @Override
    public Admin getAdmin(Long id) {
        return adminRepo.findById(id).orElse(null);
    }

    
    @Override
	public Admin update(Long id, Admin updatedAdmin) {
    	Admin old = adminRepo.findById(id).orElse(null);
        if (old == null) return null;

        old.setEmail(updatedAdmin.getEmail());
        old.setPassword(updatedAdmin.getPassword());

        return adminRepo.save(old);
    }
    
    @Override
	public void deleteAdmin(Long id) {
    	adminRepo.deleteById(id);
	}
    
    @Override
    public Admin login(String email, String password) {
        return adminRepo.findByEmailAndPassword(email, password);
    }
}
