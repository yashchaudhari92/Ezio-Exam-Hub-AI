package com.onlineExam.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.onlineExam.entity.Institute;

public interface InstituteService {

	Institute registerInstitute(
			Institute institute,
			MultipartFile paymentImg,
			MultipartFile instituteLogo
	) throws Exception;

	Institute registerInstituteForPhonePe(
			Institute institute,
			MultipartFile instituteLogo
	) throws Exception;

	Institute findByEmail(String email);

	boolean emailExists(String email);

	List<Institute> getAllInstitutes();

	List<String> getActiveInstituteNames();

	Institute getInstituteById(Long id);

	Institute updateInstitute(Long id, Institute inst);

	void deleteInstitute(Long id);
}


// OLD Code

//package com.onlineExam.service;
//
//import java.util.List;
//
//import org.springframework.web.multipart.MultipartFile;
//
//import com.onlineExam.entity.Institute;
//
//public interface InstituteService {
//	Institute registerInstitute(Institute institute, MultipartFile paymentImg, MultipartFile instituteLogo) throws Exception;
//	Institute findByEmail(String email);
//	boolean emailExists(String email);
//	List<Institute> getAllInstitutes();
//	List<String> getActiveInstituteNames();
//    Institute getInstituteById(Long id);
//    Institute updateInstitute(Long id, Institute inst);
//    void deleteInstitute(Long id);
//}
