package com.onlineExam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.onlineExam.entity.QrCode;

@Repository
public interface QrCodeRepository extends JpaRepository<QrCode, Long> {

}
