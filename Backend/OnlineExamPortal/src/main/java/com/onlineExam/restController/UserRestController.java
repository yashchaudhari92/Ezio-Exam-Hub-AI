package com.onlineExam.restController;

import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.onlineExam.entity.OtpStore;
import com.onlineExam.entity.User;
import com.onlineExam.repository.UserRepository;
import com.onlineExam.service.EmailService;
import com.onlineExam.service.UserService;

import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/api/user")
@CrossOrigin("*")
public class UserRestController {

	@Autowired
	private UserService userService;	
	@Autowired
    private UserRepository userRepo;
	@Autowired
    private EmailService emailService;	
	@Autowired 
	private OtpStore otpStore;

	@PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String,String> req) {
        String email = req.get("email");
        if (userRepo.existsByEmail(email))
            return ResponseEntity.badRequest().body("Email already exists");
        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
        otpStore.saveOtp(email, otp);
        emailService.sendOtpEmail(email, otp);
        return ResponseEntity.ok("OTP Sent");
    }

    @PostMapping("/verify-otp-register")
    public ResponseEntity<?> verifyOtp(@RequestBody User user) {
        if (!otpStore.verifyOtp(user.getEmail(), user.getOtp())) {
            return ResponseEntity.badRequest()
                    .body("Invalid OTP, Please fill correct OTP");
        }
        user.setStatus("In Active");
        userRepo.save(user);
        otpStore.clear(user.getEmail());
        emailService.sendRegistrationEmail(user.getEmail(), user.getName(), user.getInstitute());
        return ResponseEntity.ok("Registration Successful");
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginData) {
        User user = userRepo.findByEmail(loginData.getEmail());
        if (user == null) {
            return ResponseEntity.badRequest().body("Email not found!");
        }
        if (!user.getPassword().equals(loginData.getPassword())) {
            return ResponseEntity.badRequest().body("Incorrect Password!");
        }
        if (!"Active".equalsIgnoreCase(user.getStatus())) {
            return ResponseEntity.badRequest()
                    .body("Your account is not active yet. Please wait for activation.");
        }
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/by-institute/{name}")
    public List<User> getUsersByInstitute(@PathVariable String name) {
        return userRepo.findByInstitute(name);
    }

 // GET ALL Users
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
//    User Update all Data(Institute side)
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {

        User user = userRepo.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found!");
        }

        user.setName(updatedUser.getName());
        user.setEmail(updatedUser.getEmail());
        user.setPhoneNo(updatedUser.getPhoneNo());
        user.setPassword(updatedUser.getPassword());
        user.setStatus(updatedUser.getStatus());

        userRepo.save(user);
        return ResponseEntity.ok("User updated successfully!");
    }

//    Update user (User Profile Edit)
    @PutMapping("/update-password/{id}")
    public ResponseEntity<?> updatePassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newPassword = body.get("password");
        User user = userRepo.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found!");
        }
        user.setPassword(newPassword);
        userRepo.save(user);
        return ResponseEntity.ok("Password updated successfully!");
    }
    
//    Active All Users
    @PutMapping("/activate-all/{institute}")
    @Transactional
    public ResponseEntity<?> activateAll(@PathVariable String institute) {

        int updatedCount = userRepo.activateAllUsers(institute);

        if (updatedCount == 0) {
            return ResponseEntity.ok("No inactive users found");
        }
        return ResponseEntity.ok(updatedCount + " users activated successfully");
    }
    
    // Delete User
 	@DeleteMapping("/delete/{id}")
 	public ResponseEntity<?> deleteUser(@PathVariable Long id) {
 		userService.deleteUser(id);
 		return ResponseEntity.ok("Deleted successfully!");
 	}
 	
}
