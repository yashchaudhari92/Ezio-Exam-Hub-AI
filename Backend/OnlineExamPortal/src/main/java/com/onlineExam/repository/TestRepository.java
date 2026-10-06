package com.onlineExam.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.transaction.Transactional;

import com.onlineExam.entity.Test;

@Repository
public interface TestRepository extends JpaRepository<Test, Long> {
//	List<Test> findByInstitudeAndLanguage(String institude, String language);
	List<Test> findByInstitudeAndLanguageAndStatus(String institude, String language, String status);
	List<Test> findByInstitude(String institude);
	
	List<Test> findByStatus(String status);
	
	@Transactional
    @Modifying
    @Query("DELETE FROM Test t WHERE t.institude = :institute")
	void deleteByInstituteName(@Param("institute") String institute);
}
