package com.onlineExam.repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.onlineExam.entity.ExamAttempt;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
	List<ExamAttempt> findByUserEmail(String userEmail);
	List<ExamAttempt> findByInstituteName(String instituteName);
	List<ExamAttempt> findByTest_Id(Long testId);
	Optional<ExamAttempt> findByIdAndInstituteName(Long id, String instituteName);
	boolean existsByUserEmailAndTest_Id(String userEmail, Long testId);
	
	Optional<ExamAttempt> findByUserEmailAndTest_Id(String userEmail, Long testId);
	
	List<ExamAttempt> findByTest_IdAndInstituteName(Long testId, String instituteName);
	
	
	@Transactional
    @Modifying
    @Query("DELETE FROM ExamAttempt e WHERE e.userEmail = :email")
    void deleteByUserEmail(@Param("email") String email);
	
	@Transactional
	@Modifying
	@Query("DELETE FROM ExamAttempt e WHERE e.instituteName = :institute")
	void deleteByInstituteName(@Param("institute") String institute);
}
