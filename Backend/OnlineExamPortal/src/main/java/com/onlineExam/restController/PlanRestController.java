package com.onlineExam.restController;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.onlineExam.entity.Plan;
import com.onlineExam.service.PlanService;

@RestController
@RequestMapping("/api/plan")
@CrossOrigin("*")
public class PlanRestController {

	@Autowired
	private PlanService planService;
	
	@PostMapping("/save")
	public Plan savePlan(@RequestBody Plan plan) {
		return planService.savePlan(plan);
	}

	@GetMapping("/all")
	public List<Plan> getAllPlans() {
		return planService.getAllPlans();
	}

	@GetMapping("/{id}")
	public Plan getPlanById(@PathVariable Long id) {
		return planService.getPlanById(id);
	}
	
	@GetMapping("/active")
	public List<Plan> getActivePlans() {
	    return planService.getActivePlans();
	}

	@DeleteMapping("/{id}")
	public String deletePlan(@PathVariable Long id) {
		planService.deletePlan(id);
		return "Deleted";
	}
}
