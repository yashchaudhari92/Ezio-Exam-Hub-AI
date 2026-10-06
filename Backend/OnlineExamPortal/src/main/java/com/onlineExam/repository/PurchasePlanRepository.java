package com.onlineExam.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.transaction.Transactional;

import com.onlineExam.entity.PurchasePlan;

@Repository
public interface PurchasePlanRepository  extends JpaRepository<PurchasePlan, Long>{
	List<PurchasePlan> findByInstituteName(String instituteName);
	
	@Transactional
	@Modifying
	@Query("DELETE FROM PurchasePlan p WHERE p.instituteName = :institute")
	void deleteByInstituteName(@Param("institute") String institute);
}
