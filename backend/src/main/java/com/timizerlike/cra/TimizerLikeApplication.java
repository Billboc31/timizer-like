package com.timizerlike.cra;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class TimizerLikeApplication {

    public static void main(String[] args) {
        SpringApplication.run(TimizerLikeApplication.class, args);
    }
}
