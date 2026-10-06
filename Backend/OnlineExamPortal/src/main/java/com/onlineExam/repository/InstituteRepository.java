package com.onlineExam.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.onlineExam.entity.Institute;

@Repository
public interface InstituteRepository extends JpaRepository<Institute, Long>{
	boolean existsByEmail(String email);
	Institute findByEmail(String email);
	Institute findByInstituteName(String instituteName);
	@Query("SELECT i.instituteName FROM Institute i WHERE i.status = 'Active'")
	List<String> findActiveInstituteNames();
}
