package com.rod.rollenia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RolleniaApplication {

	public static void main(String[] args) {
		SpringApplication.run(RolleniaApplication.class, args);
	}

}
