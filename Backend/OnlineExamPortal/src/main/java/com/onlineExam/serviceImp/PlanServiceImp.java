package com.onlineExam.serviceImp;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.onlineExam.entity.Plan;
import com.onlineExam.repository.PlanRepository;
import com.onlineExam.service.PlanService;

@Service
public class PlanServiceImp implements PlanService{

	@Autowired
	private PlanRepository planRepo;
	
	@Override
	public Plan savePlan(Plan plan) {
		return planRepo.save(plan);
	}

	@Override
	public List<Plan> getAllPlans() {
		return planRepo.findAll();
	}

	@Override
	public Plan getPlanById(Long id) {
		return planRepo.findById(id).orElse(null);
	}
	
	@Override
	public List<Plan> getActivePlans() {
	    return planRepo.findByStatus("Active");
	}

	@Override
	public void deletePlan(Long id) {
		planRepo.deleteById(id);
	}
}
