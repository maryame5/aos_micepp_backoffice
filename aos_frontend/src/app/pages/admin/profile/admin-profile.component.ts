import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-agent-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    TranslateModule,
    PageHeaderComponent
  ],
  template: `
    <div class="profile-container">
      <app-page-header
        title="{{ 'profile.title' | translate }}"
        subtitle="{{ 'profile.subtitle' | translate }}">
      </app-page-header>

      <div class="profile-content" *ngIf="currentUser">
        <mat-tab-group class="profile-tabs">
          <!-- Personal Information Tab -->
          <mat-tab label="{{ 'profile.personalInfoTab' | translate }}">
            <div class="tab-content">
              <mat-card class="profile-card">
                <mat-card-header>
                  <div class="profile-avatar">
                    <mat-icon class="avatar-icon">account_circle</mat-icon>
                  </div>
                  <div class="profile-header-info">
                    <mat-card-title>{{ currentUser.email }} </mat-card-title>
                    <mat-card-subtitle>{{ currentUser.email }}</mat-card-subtitle>
                  </div>
                </mat-card-header>

                <mat-card-content>
                  <div class="profile-info-grid">
                    <div class="info-item">
                      <label>{{ 'profile.firstName' | translate }}</label>
                      <span>{{ currentUser.firstName }}</span>
                    </div>
                    <div class="info-item">
                      <label>{{ 'profile.lastName' | translate }}</label>
                      <span>{{ currentUser.lastName }}</span>
                    </div>
                    <div class="info-item">
                      <label>{{ 'profile.email' | translate }}</label>
                      <span>{{ currentUser.email }}</span>
                    </div>
                    <div class="info-item">
                      <label>{{ 'profile.phone' | translate }}</label>
                      <span>{{ currentUser.phoneNumber || ('profile.notSpecified' | translate) }}</span>
                    </div>
                    <div class="info-item">
                      <label>{{ 'profile.department' | translate }}</label>
                      <span>{{ currentUser.department || ('profile.notSpecified' | translate) }}</span>
                    </div>
                    <div class="info-item">
                      <label>{{ 'profile.role' | translate }}</label>
                      <span>{{ getRoleLabel(currentUser.role) }}</span>
                    </div>
                    <div class="info-item">
                      <label>{{ 'profile.status' | translate }}</label>
                      <span class="status-active">{{ getAccountStatus() }}</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Security Tab -->
          <mat-tab label="{{ 'profile.securityTab' | translate }}">
            <div class="tab-content">
              <mat-card class="security-card">
                <mat-card-header>
                  <mat-card-title>{{ 'profile.passwordResetTitle' | translate }}</mat-card-title>
                  <mat-card-subtitle>{{ 'profile.passwordResetSubtitle' | translate }}</mat-card-subtitle>
                </mat-card-header>

                <mat-card-content>
                  <p class="security-description">
                    {{ 'profile.passwordResetDescription' | translate }}
                  </p>

                  <div class="form-actions">
                    <button
                      mat-raised-button
                      color="primary"
                      type="button"
                      (click)="requestPasswordReset()"
                      [disabled]="isRequestingReset">
                    <mat-icon *ngIf="isRequestingReset">hourglass_empty</mat-icon>
                    {{ isRequestingReset ? ('profile.sending' | translate) : ('profile.notifyAdmin' | translate) }}
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="account-info-card">
                <mat-card-header>
                  <mat-card-title>{{ 'profile.accountInfoTitle' | translate }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="account-info-grid">
                    <div class="info-item">
                      <label>{{ 'profile.accountStatus' | translate }}</label>
                      <span class="status-active">{{ currentUser.isActive ? ('profile.active' | translate) : ('profile.inactive' | translate) }}</span>
                    </div>
                    <div class="info-item">
                      <label>{{ 'profile.role' | translate }}</label>
                      <span>{{ getRoleLabel(currentUser.role) }}</span>
                    </div>
                    <div class="info-item">
                      <label>{{ 'profile.lastLogin' | translate }}</label>
                      <span>{{ currentUser.lastLogin ? (currentUser.lastLogin | date:'short') : ('profile.never' | translate) }}</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 1rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .profile-tabs {
      margin-top: 0;
    }

    .tab-content {
      padding: 2rem 0;
    }

    .profile-card,
    .security-card,
    .account-info-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .profile-avatar {
      margin-right: 1rem;
    }

    .avatar-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #3b82f6;
    }

    .profile-header-info {
      display: flex;
      flex-direction: column;
    }

    .profile-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }

    .security-description {
      color: #6b7280;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }

    .profile-form,
    .password-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 2rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .account-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .info-item label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
    }

    .info-item span {
      color: #6b7280;
    }

    .status-active {
      color: #059669 !important;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 0.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .tab-content {
        padding: 1rem 0;
      }

      .profile-avatar {
        margin-right: 0;
        margin-bottom: 1rem;
      }

      .account-info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminProfileComponent implements OnInit {
  currentUser: User | null = null;
  isRequestingReset = false;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  requestPasswordReset(): void {
    if (!this.isRequestingReset && this.currentUser) {
      this.isRequestingReset = true;

      this.authService.resetPassword(this.currentUser.email).subscribe({
        next: (message: string) => {
          this.isRequestingReset = false;
          this.snackBar.open(this.translate.instant('profile.resetSuccess'), this.translate.instant('common.close'), {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.isRequestingReset = false;
          this.snackBar.open(this.translate.instant('profile.resetError'), this.translate.instant('common.close'), {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  getAccountStatus(): string {
    const mustChangePassword = localStorage.getItem('mustChangePassword') === 'true';
    return this.translate.instant(mustChangePassword ? 'profile.temporaryPassword' : 'profile.active');
  }

  getRoleLabel(role: string): string {
    return this.translate.instant('roles.' + role.toLowerCase());
  }
}
