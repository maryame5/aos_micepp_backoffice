import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule
  ],
  template: `
    <div class="notifications-container">
      <h2 class="text-2xl font-bold mb-4">Notifications</h2>

      <mat-card *ngIf="notifications.length === 0" class="no-notifications">
        <mat-card-content>
          <p>Aucune notification</p>
        </mat-card-content>
      </mat-card>

      <mat-card *ngFor="let notification of notifications" class="notification-card" [class.read]="notification.isRead">
        <mat-card-content>
          <div class="notification-header">
            <mat-icon>{{ getIcon(notification.type) }}</mat-icon>
            <h3 class="notification-title">{{ notification.title }}</h3>
            <span class="notification-date">{{ formatDate(notification.createdAt) }}</span>
          </div>
          <p class="notification-message">{{ notification.message }}</p>
          <div class="notification-actions" *ngIf="notification.actionUrl">
            <button mat-button color="primary" (click)="navigateToAction(notification)">
              Voir détails
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <div class="actions" *ngIf="notifications.length > 0">
        <button mat-raised-button color="primary" (click)="markAllAsRead()">
          Marquer tout comme lu
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      padding: 1rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .notification-card {
      margin-bottom: 1rem;
      transition: opacity 0.3s;
    }

    .notification-card.read {
      opacity: 0.6;
    }

    .notification-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .notification-title {
      flex: 1;
      font-weight: 500;
    }

    .notification-date {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .notification-message {
      margin-bottom: 0.5rem;
    }

    .notification-actions {
      text-align: right;
    }

    .no-notifications {
      text-align: center;
      padding: 2rem;
    }

    .actions {
      text-align: center;
      margin-top: 2rem;
    }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getUserNotifications().subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  getIcon(type: string): string {
    switch (type) {
      case 'info': return 'info';
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'notifications';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  navigateToAction(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id.toString()).subscribe(() => {
        notification.isRead = true;
      });
    }
    if (notification.actionUrl) {
      const validUrl = notification.actionUrl.startsWith('/') ? notification.actionUrl : '/' + notification.actionUrl;
      this.router.navigateByUrl(validUrl);
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
    });
  }
}
