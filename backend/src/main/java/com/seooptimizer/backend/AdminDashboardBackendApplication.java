package com.seooptimizer.backend;

import org.springframework.boot.SpringApplication;
import com.seooptimizer.backend.config.CorsConfig;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(CorsConfig.class) 
public class AdminDashboardBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(AdminDashboardBackendApplication.class, args);
	}

}
