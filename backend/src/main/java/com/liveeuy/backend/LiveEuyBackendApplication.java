package com.liveeuy.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class LiveEuyBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(LiveEuyBackendApplication.class, args);
    }
}
