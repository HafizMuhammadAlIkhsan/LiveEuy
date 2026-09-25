package com.liveeuy.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("LiveEuy Streaming Platform API")
                        .description("RESTful Backend Service & Contract for LiveEuy Online Video Streaming Platform (Web, Android & iOS Clients)")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("LiveEuy Engineering Team")
                                .email("engineering@liveeuy.com")
                                .url("https://github.com/HafizMuhammadAlIkhsan/LiveEuy"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Development Server (Local)"),
                        new Server().url("https://api.liveeuy.com").description("Production Server")
                ));
    }
}
