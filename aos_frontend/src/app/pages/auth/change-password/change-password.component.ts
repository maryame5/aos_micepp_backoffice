import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="change-password-container">
      <mat-card class="change-password-card">
        <mat-card-header class="card-header">
          <div class="logo">
            <mat-icon class="logo-icon">security</mat-icon>
            <h1>Changer le mot de passe</h1>
          </div>
          <p class="subtitle">Veuillez définir un nouveau mot de passe sécurisé</p>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="changePasswordForm" (ngSubmit)="onSubmit()" class="form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe actuel</mat-label>
              <input matInput [type]="hideCurrentPassword ? 'password' : 'text'" formControlName="currentPassword">
              <button mat-icon-button matSuffix (click)="hideCurrentPassword = !hideCurrentPassword" type="button">
                <mat-icon>{{ hideCurrentPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="changePasswordForm.get('currentPassword')?.hasError('required')">
                Le mot de passe actuel est requis
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nouveau mot de passe</mat-label>
              <input matInput [type]="hideNewPassword ? 'password' : 'text'" formControlName="newPassword">
              <button mat-icon-button matSuffix (click)="hideNewPassword = !hideNewPassword" type="button">
                <mat-icon>{{ hideNewPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="changePasswordForm.get('newPassword')?.hasError('required')">
                Le nouveau mot de passe est requis
              </mat-error>
              <mat-error *ngIf="changePasswordForm.get('newPassword')?.hasError('minlength')">
                Le mot de passe doit contenir au moins 8 caractères
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmer le nouveau mot de passe</mat-label>
              <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" formControlName="confirmPassword">
              <button mat-icon-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword" type="button">
                <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="changePasswordForm.get('confirmPassword')?.hasError('required')">
                La confirmation est requise
              </mat-error>
              <mat-error *ngIf="changePasswordForm.hasError('passwordMismatch')">
                Les mots de passe ne correspondent pas
              </mat-error>
            </mat-form-field>

            <div class="password-requirements">
              <p class="requirements-title">Exigences du mot de passe :</p>
              <ul class="requirements-list">
                <li [class.valid]="hasMinLength()">Au moins 8 caractères</li>
                <li [class.valid]="hasUpperCase()">Une lettre majuscule</li>
                <li [class.valid]="hasLowerCase()">Une lettre minuscule</li>
                <li [class.valid]="hasNumber()">Un chiffre</li>
              </ul>
            </div>

            <button 
              mat-raised-button 
              color="primary" 
              type="submit" 
              class="submit-button full-width"
              [disabled]="changePasswordForm.invalid || isLoading">
              {{ isLoading ? 'Modification en cours...' : 'Changer le mot de passe' }}
            </button>
          </form>

          <div class="form-footer">
            <a routerLink="/auth/login" class="back-link">
              <mat-icon>arrow_back</mat-icon>
              Retour à la connexion
            </a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .change-password-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .change-password-card {
      width: 100%;
      max-width: 450px;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .logo-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #667eea;
    }

    .logo h1 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .subtitle {
      color: #64748b;
      margin: 0;
      font-size: 0.875rem;
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .password-requirements {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
    }

    .requirements-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 0.5rem 0;
    }

    .requirements-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .requirements-list li {
      font-size: 0.75rem;
      color: #6b7280;
      margin: 0.25rem 0;
      position: relative;
      padding-left: 1.5rem;
    }

    .requirements-list li::before {
      content: '×';
      position: absolute;
      left: 0;
      color: #dc2626;
      font-weight: bold;
    }

    .requirements-list li.valid {
      color: #059669;
    }

    .requirements-list li.valid::before {
      content: '✓';
      color: #059669;
    }

    .submit-button {
      height: 48px;
      font-weight: 500;
      margin-top: 1rem;
    }

    .form-footer {
      margin-top: 2rem;
      text-align: center;
    }

    .back-link {
      color: #3b82f6;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .back-link:hover {
      text-decoration: underline;
    }
  `]
})
export class ChangePasswordComponent {
  changePasswordForm: FormGroup;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  hasMinLength(): boolean {
    const newPassword = this.changePasswordForm.get('newPassword')?.value || '';
    return newPassword.length >= 8;
  }

  hasUpperCase(): boolean {
    const newPassword = this.changePasswordForm.get('newPassword')?.value || '';
    return /[A-Z]/.test(newPassword);
  }

  hasLowerCase(): boolean {
    const newPassword = this.changePasswordForm.get('newPassword')?.value || '';
    return /[a-z]/.test(newPassword);
  }

  hasNumber(): boolean {
    const newPassword = this.changePasswordForm.get('newPassword')?.value || '';
    return /\d/.test(newPassword);
  }

  onSubmit(): void {
    if (this.changePasswordForm.valid && !this.isLoading) {
      this.isLoading = true;
      const formValue = this.changePasswordForm.value;

      this.authService.changePassword(formValue).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open(
            'Mot de passe modifié avec succès',
            'Fermer',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(
            'Erreur lors de la modification du mot de passe',
            'Fermer',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
        }
      });
    }
  }
}