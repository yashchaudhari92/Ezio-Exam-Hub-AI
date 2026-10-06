package com.onlineExam.serviceImp;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.onlineExam.entity.Institute;
import com.onlineExam.repository.InstituteRepository;
import com.onlineExam.service.EmailService;

@Service
public class PlanExpiryScheduler {

	@Autowired
    private InstituteRepository instituteRepo;

    @Autowired
    private EmailService emailService;

    // Runs every day at 10:00 AM
    @Scheduled(cron = "0 0 10 * * *")
    public void sendExpiryReminder() {

        LocalDate targetDate = LocalDate.now().plusDays(5);

        List<Institute> institutes = instituteRepo.findAll();

        for (Institute inst : institutes) {

            if (inst.getPlanExpiryDate() != null &&
                inst.getPlanExpiryDate().isEqual(targetDate)) 
            {
                emailService.sendExpiryAlertEmail(
                        inst.getEmail(),
                        inst.getInstituteName(),
                        inst.getPlanExpiryDate()
                );
            }
        }
    }
	
}
