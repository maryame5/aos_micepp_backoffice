import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../services/auth.service';
import { LanguageService } from '../../../services/language.service';
import { User, UserRole } from '../../../models/user.model';
import { Router } from '@angular/router';
import { MatListModule } from "@angular/material/list";
import { ThemeService } from '../../../services/theme.service';
import { NotificationService, Notification } from '../../../services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatListModule
],
  template: `
    <mat-toolbar class="header-toolbar">
      <button mat-icon-button (click)="toggleSidebar.emit()" class="menu-button">
        <mat-icon>menu</mat-icon>
      </button>

      <div class="header-title">
        <h1 class="text-xl font-semibold text-primary-700">AOS MICEPP </h1>
      </div>

      <div class="header-actions">
        <!-- Language Selector -->
        <button mat-button [matMenuTriggerFor]="languageMenu" class="language-btn">
          <mat-icon>language</mat-icon>
          <span>{{ getCurrentLanguageFlag() }}</span>
        </button>
        <mat-menu #languageMenu="matMenu">
          <button 
            mat-menu-item 
            *ngFor="let lang of availableLanguages" 
            (click)="changeLanguage(lang.code)">
            <span>{{ lang.flag }} {{ lang.name }}</span>
          </button>
        </mat-menu>

        <!-- Notifications -->
        <button mat-icon-button class="notification-btn" [matMenuTriggerFor]="notificationMenu">
          <mat-icon matBadge="{{ unreadCount }}" matBadgeColor="accent">notifications</mat-icon>
        </button>
        <mat-menu #notificationMenu="matMenu">
          <ng-container *ngIf="notifications.length > 0; else noNotifications">
             <button mat-menu-item *ngFor="let notification of notifications | slice:0:3" (click)="openNotification(notification)" [ngClass]="{'read-notification': notification.isRead}">
              <mat-icon>{{ getIcon(notification.type) }}</mat-icon>
              <div class="notification-content">
                <span class="notification-title">{{ notification.title }}</span>
                <span class="notification-message">{{ notification.message | slice:0:50 }}{{ notification.message.length > 50 ? '...' : '' }}</span>
              </div>
            </button>
            <button mat-menu-item *ngIf="notifications.length > 3" (click)="navigateToNotifications()">
              <span>Afficher plus</span>
            </button>
            
          </ng-container>
          <ng-template #noNotifications>
            <button mat-menu-item disabled>Aucune notification</button>
          </ng-template>
        </mat-menu>

        <!-- Dark Mode Toggle -->
        <button mat-icon-button (click)="toggleDarkMode()" [attr.aria-label]="'Toggle dark mode'" class="dark-mode-toggle-btn">
          <mat-icon>{{ themeService.isDarkMode() ? 'dark_mode' : 'light_mode' }}</mat-icon>
        </button>

        <!-- User Menu -->
        <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-btn" *ngIf="currentUser">
          
          <div class="user-info" [class.rtl]="isRTL()">
            <span class="user-name">{{ currentUser.firstName }} {{ currentUser.lastName }}</span>
             </div>
          <mat-icon>arrow_drop_down</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item (click)="navigateToProfile()">
            <mat-icon>person</mat-icon>
            <span>Profil</span>
          </button>
          <button mat-menu-item (click)="navigateToSettings()">
            <mat-icon>settings</mat-icon>
            <span>Paramètres</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()" class="logout-btn">
            <mat-icon>logout</mat-icon>
            <span>Déconnexion</span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1rem;
      background: white !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .header-title {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .user-menu-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-radius: 8px;
      padding: 0.5rem;
    }

    .user-avatar {
      color: #3b82f6;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
    }

    .user-info.rtl {
      align-items: flex-end;
      text-align: right;
    }

    .user-name {
      font-weight: 500;
      font-size: 0.875rem;
    }

    .user-role {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .language-btn {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .logout-btn {
      color: #dc2626 !important;
    }

    .dark-mode-toggle-btn {
      color: #6b7280;
    }

    .read-notification {
      opacity: 0.6;
    }

    .notification-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .notification-title {
      font-weight: 500;
      font-size: 0.875rem;
    }

    .notification-message {
      font-size: 0.75rem;
      color: #6b7280;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    @media (max-width: 768px) {
      .header-title span {
        display: none;
      }

      .user-info {
        display: none;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  
  currentUser: User | null = null;
  availableLanguages = this.languageService.getAvailableLanguages();

  unreadCount: number = 0;
  notifications: Notification[] = [];

  constructor(
    private authService: AuthService,
    private languageService: LanguageService,
    private router: Router,
    public themeService: ThemeService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadNotifications();
    this.loadUnreadCount();
  }

  loadNotifications(): void {
    this.notificationService.getUserNotifications().subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe(count => {
      this.unreadCount = count;
    });
  }

  openNotification(notification: Notification): void {
    console.log('Opening notification:', notification);
    console.log('Action URL:', notification.actionUrl);
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id.toString()).subscribe(() => {
        notification.isRead = true;
        this.loadUnreadCount();
      });
    }
    if (notification.actionUrl) {
      // Fix for 404: ensure actionUrl is a valid route path
      const validUrl = notification.actionUrl.startsWith('/') ? notification.actionUrl : '/' + notification.actionUrl;
      console.log('Navigating to:', validUrl);
      this.router.navigateByUrl(validUrl);
    } else {
      console.log('No actionUrl for notification');
    }
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

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  getCurrentLanguageFlag(): string {
    const currentLang = this.languageService.getCurrentLanguage();
    const lang = this.availableLanguages.find(l => l.code === currentLang);
    return lang ? lang.flag : '🇫🇷';
  }

  changeLanguage(langCode: string): void {
    this.languageService.setLanguage(langCode);
  }

  isRTL(): boolean {
    return this.languageService.isRTL();
  }

  getRoleLabel(role: string): string {
    const roleLabels: Record<string, string> = {
      'ADMIN': 'Administrateur',
      'SUPPORT': 'Support',
      'AGENT': 'Agent',
      'VISITOR': 'Visiteur'
    };
    return roleLabels[role] || role;
  }

  navigateToProfile(): void {
    if (this.currentUser?.role === UserRole.SUPPORT) {
      this.router.navigate(['/agent/profile']);
    } else {
      this.router.navigate(['/admin/profile']);
    }
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }

  navigateToNotifications(): void {
    this.router.navigate(['/admin/notifications']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
