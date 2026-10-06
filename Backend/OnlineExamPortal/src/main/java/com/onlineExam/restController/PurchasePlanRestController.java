package com.onlineExam.restController;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import com.onlineExam.entity.PurchasePlan;
import com.onlineExam.repository.PurchasePlanRepository;
import com.onlineExam.service.PurchasePlanService;

@RestController
@RequestMapping("/api/purchaseplan")
@CrossOrigin("*")
public class PurchasePlanRestController {

	@Autowired
	private PurchasePlanService purchasePlanService;
	
	@Autowired
	private PurchasePlanRepository purchasePlanRepo;
	
	@PostMapping(value = "/buy", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> buyPlan(
            @RequestParam Long instituteId,
            @RequestParam String planDuration,
            @RequestParam String price,
            @RequestParam MultipartFile paymentImg
    ) {
        try {
            purchasePlanService.buyPlan(instituteId, planDuration, price, paymentImg);
            return ResponseEntity.ok("Success");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
	
	@PutMapping("/update-status/{id}")
	public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
	    purchasePlanService.updateStatus(id, status);
	    return ResponseEntity.ok("Status Updated");
	}

	@GetMapping("/all")
	public List<PurchasePlan> getAll() {
	    return purchasePlanRepo.findAll();
	}
	
	@GetMapping("/by-institute/{name}")
	public List<PurchasePlan> getByInstitute(@PathVariable String name) {
	    return purchasePlanService.getByInstitute(name);
	}
	
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<?> deletePurchasePlan(@PathVariable Long id) {
	    if (!purchasePlanRepo.existsById(id)) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not Found");
	    }

	    purchasePlanRepo.deleteById(id);
	    return ResponseEntity.ok("Deleted Successfully");
	}
}
