package com.auth.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine; // Use spring6 for Spring Boot 3

import java.security.SecureRandom;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine; // Inject Thymeleaf engine

    @Value("${application.mail.sender-email}")
    private String senderEmail;
    @Value("${application.mail.sender-name}")
    private String senderName;

    /**
     * Generates a random 6-digit verification code.
     */
    public String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000); // 100000 - 999999
        return String.valueOf(code);
    }

    /**
     * Sends a verification email for account activation.
     */
    @Async // Run this in a separate thread
    public void sendVerificationEmail(String userName, String toEmail, String code) {
        log.info("Sending verification email to {}", toEmail);
        try {
            Context context = new Context();
            context.setVariable("name", userName);
            context.setVariable("code", code);
            context.setVariable("emailTitle", "Verify Your Account");

            String htmlBody = templateEngine.process("verification-email.html", context);
            sendHtmlEmail(toEmail, "Verify Your Account - " + senderName, htmlBody);
            
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", toEmail, e.getMessage());
        }
    }

    /**
     * Sends a password reset email.
     */
    @Async // Run this in a separate thread
    public void sendPasswordResetEmail(String userName, String toEmail, String code) {
        log.info("Sending password reset email to {}", toEmail);
         try {
            Context context = new Context();
            context.setVariable("name", userName);
            context.setVariable("code", code);
            context.setVariable("emailTitle", "Reset Your Password");

            String htmlBody = templateEngine.process("password-reset-email.html", context);
            sendHtmlEmail(toEmail, "Password Reset Request - " + senderName, htmlBody);

        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
        }
    }

    /**
     * Private helper to send the actual HTML email.
     */
    private void sendHtmlEmail(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(
                mimeMessage,
                MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                StandardCharsets.UTF_8.name()
        );

        helper.setFrom(senderName + " <" + senderEmail + ">");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true); // true = this is HTML

        mailSender.send(mimeMessage);
        log.info("HTML email sent successfully to {}", to);
    }
}
