package com.auth.backend.service;

import java.security.SecureRandom;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String senderEmail;

    /**
     * Generates a random 6-digit verification code.
     */
    public String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    /**
     * Sends a verification email (HTML) for account activation.
     */
    @Async
    public void sendVerificationEmail(String userName, String toEmail, String code) {
        try {
            Context context = new Context();
            context.setVariable("emailTitle", "Verify Your Email");
            context.setVariable("name", userName);
            context.setVariable("code", code);

            String htmlBody = templateEngine.process("verification-email.html", context);

            sendHtmlEmail(toEmail, "Verify Your Email Address", htmlBody);

            log.info("✅ Verification email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("❌ Failed to send verification email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    /**
     * Sends a password reset email (HTML) containing a 6-digit code.
     */
    @Async
    public void sendPasswordResetEmail(String userName, String toEmail, String code) {
        try {
            Context context = new Context();
            context.setVariable("emailTitle", "Password Reset Request");
            context.setVariable("name", userName);
            context.setVariable("code", code);

            String htmlBody = templateEngine.process("password-reset-email.html", context);

            sendHtmlEmail(toEmail, "Reset Your Password", htmlBody);

            log.info("✅ Password reset email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("❌ Failed to send password reset email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    /**
     * Core reusable HTML email sender.
     */
    private void sendHtmlEmail(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");

        helper.setFrom(senderEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);

        mailSender.send(message);
    }
}
