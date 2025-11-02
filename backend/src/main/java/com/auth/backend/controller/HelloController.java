package com.auth.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    @GetMapping("/")
    public String hello() {
        return "Hello, World!";
    }

    @GetMapping("/api/secure")
    public String getSecureData() {
        return "Hello, this is secured data!";
    }
}
