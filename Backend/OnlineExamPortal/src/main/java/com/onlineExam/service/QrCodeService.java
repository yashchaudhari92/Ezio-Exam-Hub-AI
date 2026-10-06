package com.onlineExam.service;

import java.util.List;

import com.onlineExam.entity.QrCode;

public interface QrCodeService {

	QrCode saveQr(QrCode qrCode);

    List<QrCode> getAllQr();

    QrCode getFirstQr();

    void deleteQr(Long id);
    
}
