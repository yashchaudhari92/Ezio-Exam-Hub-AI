package com.onlineExam.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration

public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        registry.addResourceHandler("/Images/Payments/**")
                .addResourceLocations(
                        "file:src/main/resources/static/Images/Payments/"
                );

        registry.addResourceHandler("/Images/InstituteLogo/**")
                .addResourceLocations(
                        "file:src/main/resources/static/Images/InstituteLogo/"
                );
    }
}


//package com.onlineExam.config;
//
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.servlet.config.annotation.CorsRegistry;
//import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//
//@Configuration
//public class WebConfig implements WebMvcConfigurer {
//
//	@Override
//    public void addResourceHandlers(ResourceHandlerRegistry registry) {
//
//        registry.addResourceHandler("/Images/Payments/**")
//                .addResourceLocations("file:/home/ubuntu/project/Images/Payments");
//
//        registry.addResourceHandler("/Images/InstituteLogo/**")
//                .addResourceLocations("file:/home/ubuntu/project/Images/InstituteLogo");
//
//    }
//}
//
