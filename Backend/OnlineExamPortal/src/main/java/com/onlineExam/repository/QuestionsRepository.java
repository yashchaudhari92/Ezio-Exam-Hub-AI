package com.onlineExam.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.transaction.Transactional;

import com.onlineExam.entity.Questions;

@Repository
public interface QuestionsRepository extends JpaRepository<Questions, Long>{
	List<Questions> findByTestId(Long testId);
	
	@Transactional
	@Modifying
	@Query("DELETE FROM Questions q WHERE q.test.institude = :institute")
	void deleteByInstituteName(@Param("institute") String institute);
}
