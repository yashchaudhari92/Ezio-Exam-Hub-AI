package com.onlineExam.serviceImp;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.onlineExam.entity.Help;
import com.onlineExam.repository.HelpRepository;
import com.onlineExam.service.EmailService;
import com.onlineExam.service.HelpService;

@Service
public class HelpServiceImp implements HelpService{
	
	@Autowired
	private HelpRepository helpRepo;
	
	@Override
	public Help saveHelp(Help help) {
		return helpRepo.save(help);
	}
	
	@Override
    public List<Help> getAllHelps() {
        return helpRepo.findAll();
    }

    @Override
    public void deleteHelp(Long id) {
        helpRepo.deleteById(id);
    }
}
