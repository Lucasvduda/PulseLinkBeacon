package com.pulselinkproject.pulselink.config;

import jakarta.servlet.Servlet;
import org.h2.server.web.JakartaWebServlet;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class H2ConsoleConfig {

    @Bean
    public ServletRegistrationBean<Servlet> h2ServletRegistration() {
        ServletRegistrationBean<Servlet> registrationBean =
                new ServletRegistrationBean<>(new JakartaWebServlet(), "/h2-console/*");

        registrationBean.addInitParameter("-webAllowOthers", "true");
        registrationBean.addInitParameter("-trace", "false");

        return registrationBean;
    }
}
