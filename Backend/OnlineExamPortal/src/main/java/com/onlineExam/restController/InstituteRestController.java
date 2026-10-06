package com.onlineExam.restController;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.onlineExam.entity.Institute;
import com.onlineExam.repository.InstituteRepository;
import com.onlineExam.service.EmailService;
import com.onlineExam.service.InstituteService;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/institute")
@CrossOrigin("*")
public class InstituteRestController {

	@Autowired
	private InstituteService instituteService;
	
	@Autowired
    private EmailService emailService;
	
	@Autowired
	private InstituteRepository instituteRepo;

	@PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> registerInstitute(
	        @RequestParam("instituteName") String instituteName,
	        @RequestParam("phoneNo") String phoneNo,
	        @RequestParam("email") String email,
	        @RequestParam("password") String password,
	        @RequestParam(value = "address", required = false) String address,
	        @RequestParam(value = "instituteType", required = false) String instituteType,
	        @RequestParam("plan") String plan,
	        @RequestParam("paymentImg") MultipartFile paymentImg,
	        @RequestParam("instituteLogo") MultipartFile instituteLogo
	) {
	    try {
	        if (instituteService.emailExists(email)) {
	            return ResponseEntity
	                    .status(400)
	                    .body("Email already exists!");
	        }
	        Institute inst = new Institute();
	        inst.setInstituteName(instituteName);
	        inst.setPhoneNo(phoneNo);
	        inst.setEmail(email);
	        inst.setPassword(password);
	        inst.setAddress(address);
	        inst.setInstituteType(instituteType);
	        inst.setPlan(plan);
	        Institute saved = instituteService.registerInstitute(inst, paymentImg, instituteLogo);
	        emailService.instituteRegistrationEmail(
	                saved.getEmail(),
	                saved.getInstituteName(),
	                saved.getPlan(),
	                saved.getPlanDate(),
	                saved.getPlanExpiryDate()
	        );
	        return ResponseEntity.ok(saved);
	    } catch (Exception e) {
	        return ResponseEntity.status(500).body("Error: " + e.getMessage());
	    }
	}

	@PostMapping(
			value = "/register-phonepe",
			consumes = MediaType.MULTIPART_FORM_DATA_VALUE
	)
	public ResponseEntity<?> registerInstituteForPhonePe(

			@RequestParam("instituteName")
			String instituteName,

			@RequestParam("phoneNo")
			String phoneNo,

			@RequestParam("email")
			String email,

			@RequestParam("password")
			String password,

			@RequestParam(value = "address", required = false)
			String address,

			@RequestParam(value = "instituteType", required = false)
			String instituteType,

			@RequestParam("plan")
			String plan,

			@RequestParam("instituteLogo")
			MultipartFile instituteLogo
	) {

		try {

			// =====================================================
			// Duplicate email check
			// =====================================================

			if (instituteService.emailExists(email)) {

				return ResponseEntity
						.status(400)
						.body("Email already exists!");
			}

			// =====================================================
			// Create Institute
			// =====================================================

			Institute inst =
					new Institute();

			inst.setInstituteName(
					instituteName
			);

			inst.setPhoneNo(
					phoneNo
			);

			inst.setEmail(
					email
			);

			inst.setPassword(
					password
			);

			inst.setAddress(
					address
			);

			inst.setInstituteType(
					instituteType
			);

			inst.setPlan(
					plan
			);

			// =====================================================
			// Save as Pending/In Active
			// =====================================================

			Institute saved =
					instituteService
							.registerInstituteForPhonePe(
									inst,
									instituteLogo
							);

			return ResponseEntity.ok(saved);

		} catch (Exception e) {

			return ResponseEntity
					.status(500)
					.body(
							"Error: "
									+ e.getMessage()
					);
		}
	}
	
//	Active Institute Then Login
	@PostMapping("/login")
	public ResponseEntity<?> loginInstitute(@RequestBody Institute loginData) {
	    Institute inst = instituteService.findByEmail(loginData.getEmail());
	    if (inst == null) {
	        return ResponseEntity.status(404).body("Email not found!");
	    }
	    if (!inst.getPassword().equals(loginData.getPassword())) {
	        return ResponseEntity.status(401).body("Wrong password!");
	    }
	    if (!"Active".equalsIgnoreCase(inst.getStatus())) {
	        return ResponseEntity
	                .status(403)
	                .body("Your account is In-Active. Please wait for activation.");
	    }
	    return ResponseEntity.ok(inst);
	}
	
	@GetMapping("/check-email")
	public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
	    boolean exists = instituteService.emailExists(email);
	    return ResponseEntity.ok(exists);
	}
    
    @GetMapping("/all")
    public List<Institute> getAll() {
        return instituteService.getAllInstitutes();
    }
    
//    Fetch Institute User Registration form
    @GetMapping("/names")
    public List<String> getInstituteNames() {
        return instituteService.getActiveInstituteNames();
    }
    
    @GetMapping("/by-name/{name}")
    public ResponseEntity<Institute> getInstituteByName(@PathVariable String name) {
        Institute inst = instituteRepo.findByInstituteName(name);
        return ResponseEntity.ok(inst);
    }

    @GetMapping("/{id}")
    public Institute getById(@PathVariable Long id) {
        return instituteService.getInstituteById(id);
    }

    @PutMapping("/update/{id}")
    public Institute updateInstitute(@PathVariable Long id, @RequestBody Institute inst) {
        return instituteService.updateInstitute(id, inst);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteInstitute(@PathVariable Long id) {
        instituteService.deleteInstitute(id);
        return "Institute Deleted Successfully";
    }
}
