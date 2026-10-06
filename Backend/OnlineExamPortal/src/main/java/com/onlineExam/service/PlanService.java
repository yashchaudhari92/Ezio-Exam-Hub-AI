package com.onlineExam.service;

import java.util.List;
import com.onlineExam.entity.Plan;

public interface PlanService {

	Plan savePlan(Plan plan);
    List<Plan> getAllPlans();
    Plan getPlanById(Long id);
    List<Plan> getActivePlans();
    void deletePlan(Long id);
}
