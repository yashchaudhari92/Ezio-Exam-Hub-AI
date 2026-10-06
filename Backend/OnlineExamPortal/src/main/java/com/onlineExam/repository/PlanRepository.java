package com.onlineExam.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.onlineExam.entity.Plan;

@Repository
public interface PlanRepository extends JpaRepository<Plan, Long> {
	List<Plan> findByStatus(String status);
}
