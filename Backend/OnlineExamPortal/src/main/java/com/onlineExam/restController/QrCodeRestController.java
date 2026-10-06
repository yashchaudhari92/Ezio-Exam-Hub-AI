package com.onlineExam.restController;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.onlineExam.entity.QrCode;
import com.onlineExam.service.QrCodeService;

@RestController
@RequestMapping("/api/qrcode")
@CrossOrigin("*")
public class QrCodeRestController {

	@Autowired
	private QrCodeService qrCodeService;
	
	// ADD QR
	@PostMapping("/save")
    public QrCode saveQr(@RequestBody QrCode qrCode) {
        return qrCodeService.saveQr(qrCode);
    }

    // GET ALL
    @GetMapping("/all")
    public List<QrCode> getAllQr() {
        return qrCodeService.getAllQr();
    }
    
//    Get First Image
    @GetMapping("/first")
    public QrCode getFirstQr() {
        return qrCodeService.getFirstQr();
    }

    // DELETE
    @DeleteMapping("/delete/{id}")
    public void deleteQr(@PathVariable Long id) {
        qrCodeService.deleteQr(id);
    }
}
