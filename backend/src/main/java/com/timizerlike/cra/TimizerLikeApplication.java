package com.timizerlike.cra;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.timizer", "com.timizerlike"})
@EntityScan(basePackages = "com.timizer.backend.cra")
@EnableJpaRepositories(basePackages = "com.timizer.backend.cra")
@ConfigurationPropertiesScan
public class TimizerLikeApplication {

    public static void main(String[] args) {
        SpringApplication.run(TimizerLikeApplication.class, args);
    }
}
