package com.onlineExam.repository;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.onlineExam.entity.AttemptAnswer;

@Repository
public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswer, Long>{
	List<AttemptAnswer> findByExamAttemptId(Long examAttemptId);
	
	@Transactional
    @Modifying
    @Query("DELETE FROM AttemptAnswer a WHERE a.examAttempt.id IN " +
           "(SELECT e.id FROM ExamAttempt e WHERE e.userEmail = :email)")
    void deleteByUserEmail(@Param("email") String email);
	
	@Transactional
	@Modifying
	@Query("DELETE FROM AttemptAnswer a WHERE a.examAttempt.id IN " +
	       "(SELECT e.id FROM ExamAttempt e WHERE e.instituteName = :institute)")
	void deleteByInstituteName(@Param("institute") String institute);
	
	@Transactional
	@Modifying
	@Query("DELETE FROM AttemptAnswer a WHERE a.examAttempt.id = :attemptId")
	void deleteByExamAttemptId(@Param("attemptId") Long attemptId);
}
