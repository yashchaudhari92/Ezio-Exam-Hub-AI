package com.onlineExam.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.transaction.Transactional;

import com.onlineExam.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
	boolean existsByEmail(String email);
	User findByEmail(String email);
	List<User> findByInstitute(String institute);
	@Modifying
    @Query("UPDATE User u SET u.status = 'Active' WHERE u.institute = :institute AND u.status = 'In Active'")
    int activateAllUsers(@Param("institute") String institute);
	
	@Transactional
	@Modifying
	@Query("DELETE FROM User u WHERE u.institute = :institute")
	void deleteByInstitute(@Param("institute") String institute);
}
