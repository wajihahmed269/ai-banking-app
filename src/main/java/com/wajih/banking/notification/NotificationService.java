package com.wajih.banking.notification;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification create(String username, String title, String message, String type) {
        Notification notification = new Notification();
        notification.setUsername(username);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        return notificationRepository.save(notification);
    }

    public List<Notification> listForUser(String username) {
        return notificationRepository.findTop50ByUsernameOrderByCreatedAtDesc(username);
    }

    @Transactional
    public Notification markRead(String username, Long id) {
        Notification notification = notificationRepository.findByIdAndUsername(id, username)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}
