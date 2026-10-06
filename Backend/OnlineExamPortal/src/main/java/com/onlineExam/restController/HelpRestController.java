package com.onlineExam.restController;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.onlineExam.entity.Help;
import com.onlineExam.service.EmailService;
import com.onlineExam.service.HelpService;

@RestController
@RequestMapping("/api/help")
@CrossOrigin("*")
public class HelpRestController {
	
	@Autowired
	private HelpService helpService;
	
	@Autowired
	private EmailService emailService;
	
	@PostMapping("/save")
	public ResponseEntity<?> saveHelp(@RequestBody Help help) {

	    System.out.println("NAME: " + help.getName());
	    System.out.println("EMAIL: " + help.getEmail());

	    Help saved = helpService.saveHelp(help);

	    return ResponseEntity.ok(saved);
	}

	@GetMapping("/all")
    public List<Help> getAllHelps() {
        return helpService.getAllHelps();
    }

    @PostMapping("/reply")
    public void sendReply(
            @RequestParam String email,
            @RequestParam String name,
            @RequestParam String replyMessage) {

        emailService.sendHelpReplyEmail(email, name, replyMessage);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteHelp(@PathVariable Long id) {
        helpService.deleteHelp(id);
    }

}
