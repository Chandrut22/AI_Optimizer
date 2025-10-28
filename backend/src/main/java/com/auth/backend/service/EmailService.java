package com.auth.backend.service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // Injects dependencies via constructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    
    // Injected from beans
    private final SpringTemplateEngine templateEngine;
    private final HttpClient httpClient; // Injected from HttpClientConfig

    // Injected from Render Environment Variables
    @Value("${MAILGUN_API_KEY}")
    private String mailgunApiKey;
    
    @Value("${MAILGUN_DOMAIN}")
    private String mailgunDomain;
    
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
     * Sends a verification email for account activation using Mailgun API.
     */
    @Async // Runs in a separate thread
    public void sendVerificationEmail(String userName, String toEmail, String code) {
        log.info("Preparing verification email for {}", toEmail);
        try {
            // 1. Process the Thymeleaf template
            Context context = new Context();
            context.setVariable("emailTitle", "Verify Your Account");
            context.setVariable("name", userName);
            context.setVariable("code", code);
            // Process templates/verification-email.html
            String htmlBody = templateEngine.process("verification-email.html", context);
            
            // 2. Send the email via Mailgun API
            sendHtmlEmail(toEmail, "Verify Your Account - " + senderName, htmlBody);
            
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    /**
     * Sends a password reset email using Mailgun API.
     */
    @Async // Runs in a separate thread
    public void sendPasswordResetEmail(String userName, String toEmail, String code) {
        log.info("Preparing password reset email for {}", toEmail);
         try {
            // 1. Process the Thymeleaf template
            Context context = new Context();
            context.setVariable("emailTitle", "Reset Your Password");
            context.setVariable("name", userName);
            context.setVariable("code", code);
            // Process templates/password-reset-email.html
            String htmlBody = templateEngine.process("password-reset-email.html", context);
            
            // 2. Send the email via Mailgun API
            sendHtmlEmail(toEmail, "Password Reset Request - " + senderName, htmlBody);

        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    /**
     * Private helper to send the actual HTML email via the Mailgun API (HTTPS).
     * This replaces the JavaMailSender (SMTP) logic.
     */
    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        // 1. Create Basic Auth header
        String auth = Base64.getEncoder().encodeToString(("api:" + mailgunApiKey).getBytes(StandardCharsets.UTF_8));

        // 2. Build URL-encoded form data
        Map<String, String> formData = Map.of(
            "from", String.format("%s <%s>", senderName, senderEmail),
            "to", to,
            "subject", subject,
            "html", htmlBody // Use 'html' field for HTML content
        );
        String formBody = formData.entrySet().stream()
            .map(e -> e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
            .collect(Collectors.joining("&"));
        
        // 3. Build the HTTP Request
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://api.mailgun.net/v3/" + mailgunDomain + "/messages"))
            .header("Authorization", "Basic " + auth)
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString(formBody))
            .build();
            
        // 4. Send the Request
        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("HTML email sent successfully via Mailgun to {}! Status: {}", to, response.statusCode());
            } else {
                log.error("Failed to send email via Mailgun. Status: {}, Body: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Error sending Mailgun request to {}: {}", to, e.getMessage());
            log.debug("Mailgun API Exception details: ", e);
        }
    }
}