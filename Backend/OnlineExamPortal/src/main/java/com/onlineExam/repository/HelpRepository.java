package com.onlineExam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.onlineExam.entity.Help;

@Repository
public interface HelpRepository extends JpaRepository<Help, Long>{

}
