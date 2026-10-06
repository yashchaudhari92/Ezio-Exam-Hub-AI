package com.onlineExam.serviceImp;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.onlineExam.entity.QrCode;
import com.onlineExam.repository.QrCodeRepository;
import com.onlineExam.service.QrCodeService;

@Service
public class QrCodeServiceImp implements QrCodeService {

	@Autowired
	private QrCodeRepository qrCodeRepo;
	
//	private final String UPLOAD_DIR =
//            "src/main/resources/static/Images/QRCodes/";

	@Override
    public QrCode saveQr(QrCode qrCode) {
        return qrCodeRepo.save(qrCode);
    }

    @Override
    public List<QrCode> getAllQr() {
        return qrCodeRepo.findAll();
    }
    
    
    @Override
    public QrCode getFirstQr() {
        return qrCodeRepo.findAll()
                .stream()
                .findFirst()
                .orElse(null);
    }

    @Override
    public void deleteQr(Long id) {
        qrCodeRepo.deleteById(id);
    }
}
