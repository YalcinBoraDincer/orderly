package com.bora.orderly.starter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = {"com.bora"})
@ComponentScan(basePackages = {"com.bora"})
@EnableJpaRepositories(basePackages = {"com.bora"})
public class starter {

	public static void main(String[] args) {
		SpringApplication.run(starter.class, args);
	}

}
