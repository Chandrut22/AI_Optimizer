package com.seooptimizer.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String toEmail, String name, String code) throws MessagingException, IOException {
        String htmlContent = loadTemplateWithValues(name, code);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(toEmail);
        helper.setSubject("Email Verification Code");
        helper.setText(htmlContent, true); // Enable HTML

        mailSender.send(message);
    }

    private String loadTemplateWithValues(String name, String code) throws IOException {
        ClassPathResource resource = new ClassPathResource("templates/email_verification_code.html");

        try (InputStream inputStream = resource.getInputStream()) {
            String template = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            return template.replace("{{name}}", name)
                           .replace("{{code}}", code);
        }
    }
}
