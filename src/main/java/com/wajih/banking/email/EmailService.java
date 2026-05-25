package com.wajih.banking.email;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private static final String SENDGRID_MAIL_SEND_URL = "https://api.sendgrid.com/v3/mail/send";

    private final RestTemplate restTemplate;

    @Value("${sendgrid.enabled:false}")
    private boolean enabled;

    @Value("${sendgrid.api-key:}")
    private String apiKey;

    @Value("${sendgrid.from-email:}")
    private String fromEmail;

    @Value("${sendgrid.from-name:Zephyr Banking}")
    private String fromName;

    @Value("${notifications.dev-recipient:}")
    private String devRecipient;

    public boolean sendTransactionReceipt(String username, String subject, String message) {
        if (!enabled || isBlank(apiKey) || isBlank(fromEmail) || isBlank(devRecipient)) {
            log.debug("Transaction email skipped because SendGrid is disabled or not configured for user {}", username);
            return false;
        }

        Map<String, Object> payload = Map.of(
                "personalizations", List.of(Map.of(
                        "to", List.of(Map.of("email", devRecipient)),
                        "subject", subject
                )),
                "from", Map.of("email", fromEmail, "name", fromName),
                "content", List.of(Map.of("type", "text/plain", "value", message))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            restTemplate.postForEntity(SENDGRID_MAIL_SEND_URL, new HttpEntity<>(payload, headers), Void.class);
            return true;
        } catch (Exception exception) {
            log.warn("Transaction email delivery failed for user {}", username);
            return false;
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
