package com.onlineExam.restController;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.onlineExam.entity.Admin;
import com.onlineExam.service.AdminService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
public class AdminRestController {

	@Autowired
	private AdminService adminService;
	
	// ADD Admin
    @PostMapping("/add")
    public ResponseEntity<?> addBlog(
            @RequestParam("email") String email,
            @RequestParam("password") String password
    ) {

        Admin admin = new Admin();
        admin.setEmail(email);
        admin.setPassword(password);

        Admin saved = adminService.addAdmin(admin);
        return ResponseEntity.ok(saved);
    }
    
    // GET ALL Admins
    @GetMapping("/all")
    public ResponseEntity<?> getAllAdmins() {
        return ResponseEntity.ok(adminService.getAllAdmins());
    }
    
    @GetMapping("/get/{id}")
    public Admin getAdmin(@PathVariable Long id) {
        return adminService.getAdmin(id);
    }

    @PostMapping("/update/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestParam("email") String email,
            @RequestParam("password") String password) throws IOException {

    	Admin updated = new Admin();
    	updated.setEmail(email);
    	updated.setPassword(password);

        return ResponseEntity.ok(adminService.update(id, updated));
    }
    
 // Delete Admin
 	@DeleteMapping("/delete/{id}")
 	public ResponseEntity<?> deleteAdmin(@PathVariable Long id) {
 		adminService.deleteAdmin(id);
 		return ResponseEntity.ok("Deleted successfully!");
 	}
 	
 	@PostMapping("/login")
 	public ResponseEntity<?> login(
 	        @RequestParam String email,
 	        @RequestParam String password) {

 	    Admin admin = adminService.login(email, password);

 	    if (admin != null) {
 	        return ResponseEntity.ok("SUCCESS");
 	    } else {
 	        return ResponseEntity.status(401).body("INVALID");
 	    }
 	}
}
