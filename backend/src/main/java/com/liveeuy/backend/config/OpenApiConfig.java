package com.liveeuy.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI liveEuyOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("LiveEuy RESTful API")
                        .description("Microservice RESTful backend untuk platform streaming video LiveEuy (Mobile & Web).")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("LiveEuy Development Team")
                                .email("dev@liveeuy.id")
                                .url("https://github.com/HafizMuhammadAlIkhsan/LiveEuy"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://springdoc.org")));
    }
}
