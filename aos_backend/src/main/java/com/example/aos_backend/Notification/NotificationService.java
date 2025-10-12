package com.example.aos_backend.Notification;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.aos_backend.Repository.AdminRepository;
import com.example.aos_backend.Repository.NotificationRepository;
import com.example.aos_backend.Repository.UtilisateurRepository;
import com.example.aos_backend.dto.DemandeDTO;
import com.example.aos_backend.user.Admin;
import com.example.aos_backend.user.Notification;
import com.example.aos_backend.user.NotificationType;
import com.example.aos_backend.user.Utilisateur;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class NotificationService {
    @Autowired
    private SimpMessagingTemplate template;
    @Autowired
    private RestTemplate restTemplate;

    private final NotificationRepository notificationRepository;
    private final AdminRepository adminRepository;
    private final UtilisateurRepository userRepository;

    public void sendNotification(String message) {
        template.convertAndSend("/topic/notifications", message);
    }

    public Notification createAndSendNotification(Utilisateur user, String title, String message, NotificationType type,
            String actionUrl) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .actionUrl(actionUrl)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Send via WebSocket
        template.convertAndSend("/topic/notifications/" + user.getId(), saved);

        return saved;
    }

    public List<Notification> getUserNotifications(Utilisateur user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public long getUnreadNotificationCount(Utilisateur user) {
        return notificationRepository.countUnreadByUser(user);
    }

    public void markNotificationAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }

    public void markAllNotificationsAsRead(Utilisateur user) {
        List<Notification> notifications = notificationRepository.findByUserAndIsReadFalse(user);
        for (Notification notification : notifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(notifications);
    }

    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    public void notifyAdminNewDemande(DemandeDTO demande) {
        List<Admin> admins = adminRepository.findAll();
        for (Admin admin : admins) {
            Utilisateur user = admin.getUtilisateur();

            Notification notification = Notification.builder()
                    .user(user)
                    .title("Nouvelle demande créée")
                    .message("Une nouvelle demande a été créée: " + demande.getDescription())
                    .type(NotificationType.info)
                    .isRead(false)
                    .actionUrl("/admin/requests/" + demande.getId())
                    .build();

            notificationRepository.save(notification);

            // Send notification via WebSocket
            template.convertAndSend("/topic/notifications/" + user.getId(), notification);
        }
    }

    public void notifyAssignDemande(DemandeDTO demande) {
        // No local notification for user in aos_micepp_back for assign
        // Only send external notification to aos_micepp_public
        sendExternalNotification(demande, "assigned");
    }

    public void notifyUpdateDemande(DemandeDTO demande) {

        Utilisateur user = userRepository.findById(demande.getUtilisateurId())
                .orElseThrow();
        Notification notification = Notification.builder()
                .user(user)
                .title("demande mis a jour")
                .message("Une demande a été mise a jour: " + demande.getDescription())
                .type(NotificationType.info)
                .isRead(false)
                .actionUrl("/admin/requests/" + demande.getId())
                .build();

        notificationRepository.save(notification);

        // Send notification to aos_micepp_public
        sendExternalNotification(demande);

    }

    public void notifyFinishDemande(DemandeDTO demande, String status) {
        // No local notification for user in aos_micepp_back for finish
        // Only send external notification to aos_micepp_public
        sendExternalNotification(demande, status.toLowerCase());
    }

    private void sendExternalNotification(DemandeDTO demande) {
        sendExternalNotification(demande, "treated");
    }

    private void sendExternalNotification(DemandeDTO demande, String status) {
        try {
            String aosMiceppPublicUrl = "http://localhost:8090"; // aos_micepp_public runs on 8090
            String endpoint = "/AOS_MICEPP/notifications/external";

            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("type", "demande_" + status);
            payload.put("demandeId", demande.getId());
            payload.put("userId", demande.getUtilisateurId());
            payload.put("message", "Votre demande a été " + status + ": " + demande.getDescription());
            payload.put("actionUrl", "/agent/requests/" + demande.getId());

            restTemplate.postForEntity(aosMiceppPublicUrl + endpoint, payload, Void.class);
        } catch (Exception e) {
            // Log error, but don't fail the operation
            System.err.println("Failed to send external notification: " + e.getMessage());
        }
    }

    public void notifyAdminNewDemande(Long demandeId, String message) {
        List<Admin> admins = adminRepository.findAll();
        for (Admin admin : admins) {
            Utilisateur user = admin.getUtilisateur();

            Notification notification = Notification.builder()
                    .user(user)
                    .title("Nouvelle demande créée")
                    .message(message)
                    .type(NotificationType.info)
                    .isRead(false)
                    .actionUrl("/admin/requests/" + demandeId)
                    .build();

            notificationRepository.save(notification);

            // Send notification via WebSocket
            template.convertAndSend("/topic/notifications/" + user.getId(), notification);
        }
    }

}
