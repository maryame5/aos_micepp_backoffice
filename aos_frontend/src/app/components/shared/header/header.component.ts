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
import { User } from '../../../models/user.model';
import { Router } from '@angular/router';
import { MatListModule } from "@angular/material/list";

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
        <h1 class="text-xl font-semibold text-primary-700">AOS MICEPP</h1>
        <span class="text-sm text-gray-500">{{ getWelcomeMessage() }}</span>
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
        <button mat-icon-button class="notification-btn">
          <mat-icon matBadge="3" matBadgeColor="accent">notifications</mat-icon>
        </button>

        <!-- User Menu -->
        <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-btn" *ngIf="currentUser">
          <div class="user-avatar">
            <mat-icon>account_circle</mat-icon>
          </div>
          <div class="user-info" [class.rtl]="isRTL()">
            <span class="user-name">{{ currentUser.firstName }} {{ currentUser.lastName }}</span>
            <span class="user-role">{{ getRoleLabel(currentUser.role) }}</span>
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

  constructor(
    private authService: AuthService,
    private languageService: LanguageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getWelcomeMessage(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 17) return 'Bon après-midi';
    return 'Bonsoir';
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
    if (this.currentUser?.role === 'AGENT') {
      this.router.navigate(['/agent/profile']);
    } else {
      this.router.navigate(['/admin/profile']);
    }
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}