package com.onlineExam.serviceImp;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.onlineExam.entity.Institute;
import com.onlineExam.entity.PurchasePlan;
import com.onlineExam.repository.InstituteRepository;
import com.onlineExam.repository.PurchasePlanRepository;
import com.onlineExam.service.PurchasePlanService;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class PurchasePlanServiceImp implements PurchasePlanService {

	@Autowired
	private PurchasePlanRepository purchasePlanRepo;
	
	@Autowired
    private InstituteRepository instituteRepo;

	@Override
	public void buyPlan(Long instituteId, String planDuration, String price, MultipartFile file) throws Exception {

	    Institute inst = instituteRepo.findById(instituteId).orElseThrow();
	    String folder = "src/main/resources/static/Images/Payments";
	    Files.createDirectories(Paths.get(folder));
	    String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("\\s+", "_");
	    Path path = Paths.get(folder).resolve(filename);
	    Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
	    LocalDate planDate = LocalDate.now();
	    int months = Integer.parseInt(planDuration.split(" ")[0]);
	    LocalDate expiry = planDate.plusMonths(months);
	    // ✔ SAVE PURCHASE HISTORY
	    PurchasePlan pp = new PurchasePlan();
	    pp.setInstituteName(inst.getInstituteName());
	    pp.setDuration(planDuration);
	    pp.setPrice(price);
	    pp.setPlanDate(planDate);
	    pp.setPlanExpiryDate(expiry);
	    pp.setPaymentImg("/Images/Payments/" + filename);
	    pp.setStatus("IN_ACTIVE");
		pp.setPaymentGateway("MANUAL");

	    purchasePlanRepo.save(pp);
	}

	@Override
	public void updateStatus(Long id, String status) {
	    PurchasePlan pp = purchasePlanRepo.findById(id).orElseThrow();
	    pp.setStatus(status);
	    purchasePlanRepo.save(pp);
	    if ("ACTIVE".equals(status)) {
	        Institute inst = instituteRepo.findByInstituteName(pp.getInstituteName());
	        inst.setPlan(pp.getDuration() + " (₹" + pp.getPrice() + ")");
	        inst.setPlanDate(pp.getPlanDate());
	        inst.setPlanExpiryDate(pp.getPlanExpiryDate());
	        inst.setPaymentImg(pp.getPaymentImg());
	        instituteRepo.save(inst);
	    }
	}
	
    @Override
    public List<PurchasePlan> getByInstitute(String instituteName) {
        return purchasePlanRepo.findByInstituteName(instituteName);
    }
}
