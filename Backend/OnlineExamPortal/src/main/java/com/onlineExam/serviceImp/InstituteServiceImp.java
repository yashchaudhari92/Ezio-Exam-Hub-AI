package com.onlineExam.serviceImp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.onlineExam.entity.Institute;
import com.onlineExam.repository.AttemptAnswerRepository;
import com.onlineExam.repository.ExamAttemptRepository;
import com.onlineExam.repository.InstituteRepository;
import com.onlineExam.repository.PurchasePlanRepository;
import com.onlineExam.repository.QuestionsRepository;
import com.onlineExam.repository.TestRepository;
import com.onlineExam.repository.UserRepository;
import com.onlineExam.service.InstituteService;

import jakarta.transaction.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;

@Service
public class InstituteServiceImp implements InstituteService {

    @Autowired
    private InstituteRepository instituteRepo;

    @Autowired
    private PurchasePlanRepository purchasePlanRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ExamAttemptRepository examAttemptRepo;

    @Autowired
    private AttemptAnswerRepository attemptAnswerRepo;

    @Autowired
    private QuestionsRepository questionsRepo;

    @Autowired
    private TestRepository testRepo;

    // =========================================================
    // EXISTING MANUAL PAYMENT REGISTRATION
    // =========================================================

    @Override
    public Institute registerInstitute(
            Institute institute,
            MultipartFile paymentImg,
            MultipartFile instituteLogo) throws Exception {

        institute.setStatus("In Active");

        LocalDate planDate = LocalDate.now();
        institute.setPlanDate(planDate);

        String durationText =
                institute.getPlan().split(" ")[0];

        int months =
                Integer.parseInt(durationText);

        LocalDate expiryDate =
                planDate.plusMonths(months);

        institute.setPlanExpiryDate(expiryDate);

        // =====================================================
        // Payment Image
        // =====================================================

        String folder =
                "src/main/resources/static/Images/Payments";

        Path folderPath =
                Paths.get(folder);

        if (!Files.exists(folderPath)) {
            Files.createDirectories(folderPath);
        }

        String filename =
                System.currentTimeMillis()
                        + "_"
                        + paymentImg
                        .getOriginalFilename()
                        .replaceAll("\\s+", "_");

        Path filePath =
                folderPath.resolve(filename);

        Files.copy(
                paymentImg.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING
        );

        institute.setPaymentImg(
                "/Images/Payments/" + filename
        );

        // =====================================================
        // Institute Logo
        // =====================================================

        String logoDir =
                "src/main/resources/static/Images/InstituteLogo";

        Files.createDirectories(
                Paths.get(logoDir)
        );

        String logoFileName =
                System.currentTimeMillis()
                        + "_"
                        + instituteLogo
                        .getOriginalFilename()
                        .replaceAll("\\s+", "_");

        Path logoPath =
                Paths.get(logoDir, logoFileName);

        Files.copy(
                instituteLogo.getInputStream(),
                logoPath,
                StandardCopyOption.REPLACE_EXISTING
        );

        institute.setIntituteLogo(
                "/Images/InstituteLogo/" + logoFileName
        );

        return instituteRepo.save(institute);
    }

    // =========================================================
    // PHONEPE ORGANIZATION REGISTRATION
    // =========================================================

    @Override
    public Institute registerInstituteForPhonePe(
            Institute institute,
            MultipartFile instituteLogo) throws Exception {

        if (institute == null) {
            throw new IllegalArgumentException(
                    "Institute information is required."
            );
        }

        if (instituteLogo == null
                || instituteLogo.isEmpty()) {

            throw new IllegalArgumentException(
                    "Institute logo is required."
            );
        }

        // =====================================================
        // Organization remains inactive until PhonePe success
        // =====================================================

        institute.setStatus("In Active");

        // =====================================================
        // PhonePe controls subscription activation.
        // Therefore dates must remain NULL until payment
        // succeeds and PaymentActivationService runs.
        // =====================================================

        institute.setPlanDate(null);

        institute.setPlanExpiryDate(null);

        // PhonePe does not use payment screenshots.

        institute.setPaymentImg(null);

        // =====================================================
        // Save Institute Logo
        // =====================================================

        String logoDir =
                "src/main/resources/static/Images/InstituteLogo";

        Files.createDirectories(
                Paths.get(logoDir)
        );

        String originalFileName =
                instituteLogo.getOriginalFilename();

        if (originalFileName == null
                || originalFileName.isBlank()) {

            throw new IllegalArgumentException(
                    "Invalid institute logo file."
            );
        }

        String logoFileName =
                System.currentTimeMillis()
                        + "_"
                        + originalFileName
                        .replaceAll("\\s+", "_");

        Path logoPath =
                Paths.get(
                        logoDir,
                        logoFileName
                );

        Files.copy(
                instituteLogo.getInputStream(),
                logoPath,
                StandardCopyOption.REPLACE_EXISTING
        );

        institute.setIntituteLogo(
                "/Images/InstituteLogo/" + logoFileName
        );

        return instituteRepo.save(institute);
    }

    // =========================================================
    // EXISTING METHODS
    // =========================================================

    @Override
    public Institute findByEmail(String email) {
        return instituteRepo.findByEmail(email);
    }

    @Override
    public boolean emailExists(String email) {
        return instituteRepo.existsByEmail(email);
    }

    @Override
    public List<Institute> getAllInstitutes() {
        return instituteRepo.findAll();
    }

    @Override
    public List<String> getActiveInstituteNames() {
        return instituteRepo.findActiveInstituteNames();
    }

    @Override
    public Institute getInstituteById(Long id) {
        return instituteRepo.findById(id).orElse(null);
    }

    @Override
    public Institute updateInstitute(
            Long id,
            Institute newData) {

        Institute old =
                instituteRepo
                        .findById(id)
                        .orElseThrow();

        if (newData.getInstituteName() != null) {
            old.setInstituteName(
                    newData.getInstituteName()
            );
        }

        if (newData.getPhoneNo() != null) {
            old.setPhoneNo(
                    newData.getPhoneNo()
            );
        }

        if (newData.getEmail() != null) {
            old.setEmail(
                    newData.getEmail()
            );
        }

        if (newData.getPassword() != null
                && !newData.getPassword().isEmpty()) {

            old.setPassword(
                    newData.getPassword()
            );
        }

        if (newData.getAddress() != null) {
            old.setAddress(
                    newData.getAddress()
            );
        }

        if (newData.getStatus() != null) {
            old.setStatus(
                    newData.getStatus()
            );
        }

        if (newData.getInstituteType() != null) {
            old.setInstituteType(
                    newData.getInstituteType()
            );
        }

        if (newData.getPlan() != null) {
            old.setPlan(
                    newData.getPlan()
            );
        }

        return instituteRepo.save(old);
    }

    @Transactional
    @Override
    public void deleteInstitute(Long id) {

        Institute inst =
                instituteRepo
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Institute not found"
                                )
                        );

        String instituteName =
                inst.getInstituteName();

        // 1. Delete Attempt Answers
        attemptAnswerRepo
                .deleteByInstituteName(instituteName);

        // 2. Delete Exam Attempts
        examAttemptRepo
                .deleteByInstituteName(instituteName);

        // 3. Delete Questions
        questionsRepo
                .deleteByInstituteName(instituteName);

        // 4. Delete Tests
        testRepo
                .deleteByInstituteName(instituteName);

        // 5. Delete Users
        userRepo
                .deleteByInstitute(instituteName);

        // 6. Delete Purchase Plans
        purchasePlanRepo
                .deleteByInstituteName(instituteName);

        // 7. Finally delete Institute
        instituteRepo.deleteById(id);
    }
}


// OLD Code

//package com.onlineExam.serviceImp;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//import com.onlineExam.entity.Institute;
//import com.onlineExam.repository.AttemptAnswerRepository;
//import com.onlineExam.repository.ExamAttemptRepository;
//import com.onlineExam.repository.InstituteRepository;
//import com.onlineExam.repository.PurchasePlanRepository;
//import com.onlineExam.repository.QuestionsRepository;
//import com.onlineExam.repository.TestRepository;
//import com.onlineExam.repository.UserRepository;
//import com.onlineExam.service.InstituteService;
//
//import jakarta.transaction.Transactional;
//
//import java.nio.file.Files;
//import java.nio.file.Path;
//import java.nio.file.Paths;
//import java.nio.file.StandardCopyOption;
//import java.time.LocalDate;
//import java.util.List;
//
//@Service
//public class InstituteServiceImp implements InstituteService{
//
//	@Autowired
//	private InstituteRepository instituteRepo;
//	@Autowired private PurchasePlanRepository purchasePlanRepo;
//	@Autowired private UserRepository userRepo;
//	@Autowired private ExamAttemptRepository examAttemptRepo;
//	@Autowired private AttemptAnswerRepository attemptAnswerRepo;
//	@Autowired private QuestionsRepository questionsRepo;
//	@Autowired private TestRepository testRepo;
//
//	@Override
//    public Institute registerInstitute(Institute institute, MultipartFile paymentImg, MultipartFile instituteLogo) throws Exception {
//        institute.setStatus("In Active");
//        LocalDate planDate = LocalDate.now();
//        institute.setPlanDate(planDate);
//        String durationText = institute.getPlan().split(" ")[0];
//        int months = Integer.parseInt(durationText);
//        LocalDate expiryDate = planDate.plusMonths(months);
//        institute.setPlanExpiryDate(expiryDate);
////        Payment Image
//        String folder = "src/main/resources/static/Images/Payments";
////        String folder = "/home/ubuntu/project/Images/Payments";
//        Path folderPath = Paths.get(folder);
//        if (!Files.exists(folderPath)) {
//            Files.createDirectories(folderPath);
//        }
//        String filename = System.currentTimeMillis() + "_" +
//                paymentImg.getOriginalFilename().replaceAll("\\s+", "_");
//        Path filePath = folderPath.resolve(filename);
//        Files.copy(paymentImg.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
//        institute.setPaymentImg("/Images/Payments/" + filename);
////        Institute Logo
//        String logoDir = "src/main/resources/static/Images/InstituteLogo";
////        String logoDir = "/home/ubuntu/project/Images/InstituteLogo";
//        Files.createDirectories(Paths.get(logoDir));
//        String logoFileName = System.currentTimeMillis() + "_" +
//                instituteLogo.getOriginalFilename().replaceAll("\\s+", "_");
//        Path logoPath = Paths.get(logoDir, logoFileName);
//        Files.copy(instituteLogo.getInputStream(), logoPath, StandardCopyOption.REPLACE_EXISTING);
//        institute.setIntituteLogo("/Images/InstituteLogo/" + logoFileName);
//        return instituteRepo.save(institute);
//    }
//
//	@Override
//	public Institute findByEmail(String email) {
//	    return instituteRepo.findByEmail(email);
//	}
//
//	@Override
//	public boolean emailExists(String email) {
//	    return instituteRepo.existsByEmail(email);
//	}
//
//	@Override
//    public List<Institute> getAllInstitutes() {
//        return instituteRepo.findAll();
//    }
//
//	@Override
//	public List<String> getActiveInstituteNames() {
//	    return instituteRepo.findActiveInstituteNames();
//	}
//
//    @Override
//    public Institute getInstituteById(Long id) {
//        return instituteRepo.findById(id).orElse(null);
//    }
//
//    @Override
//    public Institute updateInstitute(Long id, Institute newData) {
//        Institute old = instituteRepo.findById(id).orElseThrow();
//        if(newData.getInstituteName() != null)
//            old.setInstituteName(newData.getInstituteName());
//        if(newData.getPhoneNo() != null)
//            old.setPhoneNo(newData.getPhoneNo());
//        if(newData.getEmail() != null)
//            old.setEmail(newData.getEmail());
//        if(newData.getPassword() != null && !newData.getPassword().isEmpty())
//            old.setPassword(newData.getPassword());
//        if(newData.getAddress() != null)
//            old.setAddress(newData.getAddress());
//        if(newData.getStatus() != null)
//            old.setStatus(newData.getStatus());
//        if(newData.getInstituteType() != null)
//            old.setInstituteType(newData.getInstituteType());
//        if(newData.getPlan() != null)
//            old.setPlan(newData.getPlan());
//        return instituteRepo.save(old);
//    }
//
//    @Transactional
//    @Override
//    public void deleteInstitute(Long id) {
//
//        Institute inst = instituteRepo.findById(id)
//                .orElseThrow(() -> new RuntimeException("Institute not found"));
//
//        String instituteName = inst.getInstituteName();
//
//        // 1. Delete Attempt Answers (sabse pehle)
//        attemptAnswerRepo.deleteByInstituteName(instituteName);
//
//        // 2. Delete Exam Attempts
//        examAttemptRepo.deleteByInstituteName(instituteName);
//
//        // 3. Delete Questions
//        questionsRepo.deleteByInstituteName(instituteName);
//
//        // 4. Delete Tests
//        testRepo.deleteByInstituteName(instituteName);
//
//        // 5. Delete Users (Students)
//        userRepo.deleteByInstitute(instituteName);
//
//        // 6. Delete Purchase Plans
//        purchasePlanRepo.deleteByInstituteName(instituteName);
//
//        // 7. Finally delete Institute
//        instituteRepo.deleteById(id);
//    }
//}
