package com.onlineExam.service;

import java.util.List;

import com.onlineExam.entity.Help;

public interface HelpService {

	Help saveHelp(Help help);
	List<Help> getAllHelps();
    void deleteHelp(Long id);
}
