import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
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
                  <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" class="profile-form">
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Prénom</mat-label>
                        <input matInput formControlName="firstName" required>
                        <mat-error *ngIf="profileForm.get('firstName')?.hasError('required')">
                          Le prénom est requis
                        </mat-error>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Nom</mat-label>
                        <input matInput formControlName="lastName" required>
                        <mat-error *ngIf="profileForm.get('lastName')?.hasError('required')">
                          Le nom est requis
                        </mat-error>
                      </mat-form-field>
                    </div>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Email</mat-label>
                      <input matInput type="email" formControlName="email" required>
                      <mat-icon matSuffix>email</mat-icon>
                      <mat-error *ngIf="profileForm.get('email')?.hasError('required')">
                        L'email est requis
                      </mat-error>
                      <mat-error *ngIf="profileForm.get('email')?.hasError('email')">
                        Format d'email invalide
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Téléphone</mat-label>
                      <input matInput type="tel" formControlName="phoneNumber">
                      <mat-icon matSuffix>phone</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Adresse</mat-label>
                      <textarea matInput formControlName="address" rows="3"></textarea>
                      <mat-icon matSuffix>location_on</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Département</mat-label>
                      <input matInput formControlName="department" readonly>
                      <mat-icon matSuffix>business</mat-icon>
                    </mat-form-field>

                    <div class="form-actions">
                      <button 
                        mat-raised-button 
                        color="primary" 
                        type="submit"
                        [disabled]="profileForm.invalid || isUpdatingProfile">
                        <mat-icon *ngIf="isUpdatingProfile">hourglass_empty</mat-icon>
                        {{ isUpdatingProfile ? 'Mise à jour...' : 'Mettre à jour' }}
                      </button>
                      <button mat-button type="button" (click)="resetForm()">
                        Annuler
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Security Tab -->
          <mat-tab label="Sécurité">
            <div class="tab-content">
              <mat-card class="security-card">
                <mat-card-header>
                  <mat-card-title>Changer le mot de passe</mat-card-title>
                  <mat-card-subtitle>Modifiez votre mot de passe pour sécuriser votre compte</mat-card-subtitle>
                </mat-card-header>

                <mat-card-content>
                  <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="password-form">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Mot de passe actuel</mat-label>
                      <input matInput [type]="hideCurrentPassword ? 'password' : 'text'" formControlName="currentPassword" required>
                      <button mat-icon-button matSuffix (click)="hideCurrentPassword = !hideCurrentPassword" type="button">
                        <mat-icon>{{ hideCurrentPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                      </button>
                      <mat-error *ngIf="passwordForm.get('currentPassword')?.hasError('required')">
                        Le mot de passe actuel est requis
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Nouveau mot de passe</mat-label>
                      <input matInput [type]="hideNewPassword ? 'password' : 'text'" formControlName="newPassword" required>
                      <button mat-icon-button matSuffix (click)="hideNewPassword = !hideNewPassword" type="button">
                        <mat-icon>{{ hideNewPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                      </button>
                      <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('required')">
                        Le nouveau mot de passe est requis
                      </mat-error>
                      <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('minlength')">
                        Le mot de passe doit contenir au moins 8 caractères
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Confirmer le nouveau mot de passe</mat-label>
                      <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" formControlName="confirmPassword" required>
                      <button mat-icon-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword" type="button">
                        <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                      </button>
                      <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">
                        La confirmation est requise
                      </mat-error>
                      <mat-error *ngIf="passwordForm.hasError('passwordMismatch')">
                        Les mots de passe ne correspondent pas
                      </mat-error>
                    </mat-form-field>

                    <div class="form-actions">
                      <button 
                        mat-raised-button 
                        color="primary" 
                        type="submit"
                        [disabled]="passwordForm.invalid || isChangingPassword">
                        <mat-icon *ngIf="isChangingPassword">hourglass_empty</mat-icon>
                        {{ isChangingPassword ? 'Modification...' : 'Changer le mot de passe' }}
                      </button>
                    </div>
                  </form>
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
                      <span class="status-active">Actif</span>
                    </div>
                    <div class="info-item">
                      <label>Rôle</label>
                      <span>{{ getRoleLabel(currentUser.role) }}</span>
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
export class AgentProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isUpdatingProfile = false;
  isChangingPassword = false;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      address: [''],
      department: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.profileForm.patchValue({
        email: this.currentUser.email
      });
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  updateProfile(): void {
    if (this.profileForm.valid && !this.isUpdatingProfile) {
      this.isUpdatingProfile = true;

      // Simulate API call
      setTimeout(() => {
        this.isUpdatingProfile = false;
        this.snackBar.open('Profil mis à jour avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }, 1500);
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid && !this.isChangingPassword) {
      this.isChangingPassword = true;
      const formValue = this.passwordForm.value;

      this.authService.changePassword(formValue).subscribe({
        next: () => {
          this.isChangingPassword = false;
          this.snackBar.open('Mot de passe modifié avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.passwordForm.reset();
        },
        error: (error) => {
          this.isChangingPassword = false;
          this.snackBar.open('Erreur lors de la modification du mot de passe', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  resetForm(): void {
    if (this.currentUser) {
      this.profileForm.patchValue({
        email: this.currentUser.email
      });
    }
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