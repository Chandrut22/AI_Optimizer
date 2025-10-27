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

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;

@Service
@RequiredArgsConstructor // Replaces @Autowired with constructor injection
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    
    // Injected via constructor
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine; // Inject Thymeleaf engine

    // Injected from application.properties
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
     * This replaces your old loadTemplateWithValues method.
     */
    @Async // Runs in a separate thread
    public void sendVerificationEmail(String userName, String toEmail, String code) {
        log.info("Sending verification email to {}", toEmail);
        try {
            // 1. Create a Thymeleaf context and add variables
            Context context = new Context();
            context.setVariable("emailTitle", "Verify Your Account");
            context.setVariable("name", userName);
            context.setVariable("code", code);

            // 2. Process the HTML template file (from templates/verification-email.html)
            String htmlBody = templateEngine.process("verification-email.html", context);
            
            // 3. Send the HTML email
            sendHtmlEmail(toEmail, "Verify Your Account - " + senderName, htmlBody);
            
        } catch (Exception e) {
            // Log errors, as @Async methods can't throw exceptions back to the controller
            log.error("Failed to send verification email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    /**
     * Sends a password reset email.
     */
    @Async // Runs in a separate thread
    public void sendPasswordResetEmail(String userName, String toEmail, String code) {
        log.info("Sending password reset email to {}", toEmail);
         try {
            Context context = new Context();
            context.setVariable("emailTitle", "Reset Your Password");
            context.setVariable("name", userName);
            context.setVariable("code", code);

            String htmlBody = templateEngine.process("password-reset-email.html", context);
            sendHtmlEmail(toEmail, "Password Reset Request - " + senderName, htmlBody);

        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    /**
     * Private helper to configure and send the actual MimeMessage.
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