package com.wajih.banking.notification;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findTop50ByUsernameOrderByCreatedAtDesc(String username);

    Optional<Notification> findByIdAndUsername(Long id, String username);
}
