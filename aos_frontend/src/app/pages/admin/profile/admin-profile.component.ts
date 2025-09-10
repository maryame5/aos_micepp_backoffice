import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
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
    PageHeaderComponent
  ],
  template: `
    <div class="profile-container">
      <app-page-header 
        title="Mon Profil" 
        subtitle="Gérez vos informations personnelles et paramètres">
      </app-page-header>

      <div class="profile-content" *ngIf="currentUser">
        <mat-tab-group class="profile-tabs">
          <!-- Personal Information Tab -->
          <mat-tab label="Informations personnelles">
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
                      <label>Prénom</label>
                      <span>{{ currentUser.firstName }}</span>
                    </div>
                    <div class="info-item">
                      <label>Nom</label>
                      <span>{{ currentUser.lastName }}</span>
                    </div>
                    <div class="info-item">
                      <label>Email</label>
                      <span>{{ currentUser.email }}</span>
                    </div>
                    <div class="info-item">
                      <label>Téléphone</label>
                      <span>{{ currentUser.phoneNumber || 'Non spécifié' }}</span>
                    </div>
                    <div class="info-item">
                      <label>Département</label>
                      <span>{{ currentUser.department || 'Non spécifié' }}</span>
                    </div>
                    <div class="info-item">
                      <label>Rôle</label>
                      <span>{{ getRoleLabel(currentUser.role) }}</span>
                    </div>
                    <div class="info-item">
                      <label>Statut</label>
                      <span class="status-active">{{ getAccountStatus() }}</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Security Tab -->
          <mat-tab label="Sécurité">
            <div class="tab-content">
              <mat-card class="security-card">
                <mat-card-header>
                  <mat-card-title>Réinitialisation du mot de passe</mat-card-title>
                  <mat-card-subtitle>Si vous avez oublié votre mot de passe, contactez l'administrateur</mat-card-subtitle>
                </mat-card-header>

                <mat-card-content>
                  <p class="security-description">
                    Pour des raisons de sécurité, vous ne pouvez pas modifier votre mot de passe directement.
                    Si vous avez oublié votre mot de passe, cliquez sur le bouton ci-dessous pour notifier l'administrateur.
                  </p>

                  <div class="form-actions">
                    <button
                      mat-raised-button
                      color="primary"
                      type="button"
                      (click)="requestPasswordReset()"
                      [disabled]="isRequestingReset">
                      <mat-icon *ngIf="isRequestingReset">hourglass_empty</mat-icon>
                      {{ isRequestingReset ? 'Envoi en cours...' : 'Notifier l\'administrateur' }}
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="account-info-card">
                <mat-card-header>
                  <mat-card-title>Informations du compte</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="account-info-grid">
                    <div class="info-item">
                      <label>Statut du compte</label>
                      <span class="status-active">{{ currentUser.isActive ? 'Actif' : 'Inactif' }}</span>
                    </div>
                    <div class="info-item">
                      <label>Rôle</label>
                      <span>{{ getRoleLabel(currentUser.role) }}</span>
                    </div>
                    <div class="info-item">
                      <label>Dernière connexion</label>
                      <span>{{ currentUser.lastLogin ? (currentUser.lastLogin | date:'short') : 'Jamais' }}</span>
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
    private snackBar: MatSnackBar
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
          this.snackBar.open(message, 'Fermer', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.isRequestingReset = false;
          this.snackBar.open('Erreur lors de l\'envoi de la demande', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  getAccountStatus(): string {
    const mustChangePassword = localStorage.getItem('mustChangePassword') === 'true';
    return mustChangePassword ? 'Mot de passe temporaire' : 'Actif';
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
}
