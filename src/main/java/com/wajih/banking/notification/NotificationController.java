package com.wajih.banking.notification;

import com.wajih.banking.dto.ApiResponse;
import com.wajih.banking.dto.notification.NotificationResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{username}")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> list(
            @PathVariable String username,
            Authentication authentication
    ) {
        requireSelf(username, authentication);
        List<NotificationResponse> notifications = notificationService.listForUser(username).stream()
                .map(NotificationResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Notifications loaded", notifications));
    }

    @PostMapping("/{username}/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markRead(
            @PathVariable String username,
            @PathVariable Long id,
            Authentication authentication
    ) {
        requireSelf(username, authentication);
        Notification notification = notificationService.markRead(username, id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked read", NotificationResponse.from(notification)));
    }

    private void requireSelf(String username, Authentication authentication) {
        if (authentication == null || !username.equals(authentication.getName())) {
            throw new AccessDeniedException("You cannot access another user's notifications");
        }
    }
}
