import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ChangePasswordRequest } from '../../../models/user.model';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="change-password-container">
      <div class="change-password-background"></div>
      
      <div class="change-password-content">
        <div class="change-password-card">
          <div class="change-password-header">
            <h1>Changez votre mot de passe</h1>
            <p>Pour votre sécurité, veuillez définir un nouveau mot de passe.</p>
          </div>

          <form [formGroup]="changePasswordForm" (ngSubmit)="onSubmit()" class="change-password-form">
            <div class="form-field">
              <label>Mot de passe actuel</label>
              <input type="password" formControlName="currentPassword" placeholder="Mot de passe actuel">
              <div class="error" *ngIf="changePasswordForm.get('currentPassword')?.invalid && changePasswordForm.get('currentPassword')?.touched">
                Mot de passe requis
              </div>
            </div>

            <div class="form-field">
              <label>Nouveau mot de passe</label>
              <input type="password" formControlName="newPassword" placeholder="Nouveau mot de passe">
              <div class="error" *ngIf="changePasswordForm.get('newPassword')?.invalid && changePasswordForm.get('newPassword')?.touched">
                Mot de passe requis (minimum 8 caractères)
              </div>
            </div>

            <div class="form-field">
              <label>Confirmer le nouveau mot de passe</label>
              <input type="password" formControlName="confirmPassword" placeholder="Confirmer le mot de passe">
              <div class="error" *ngIf="changePasswordForm.get('confirmPassword')?.invalid && changePasswordForm.get('confirmPassword')?.touched">
                Confirmation requise
              </div>
              <div class="error" *ngIf="changePasswordForm.errors?.['mismatch'] && changePasswordForm.get('confirmPassword')?.touched">
                Les mots de passe ne correspondent pas
              </div>
            </div>

            <button 
              type="submit" 
              class="change-password-button"
              [disabled]="changePasswordForm.invalid || isLoading">
              <span *ngIf="isLoading">Changement en cours...</span>
              <span *ngIf="!isLoading">Changer le mot de passe</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .change-password-container {
      min-height: 100vh;
      display: flex;
      position: relative;
      overflow: hidden;
    }

    .change-password-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      z-index: 0;
    }

    .change-password-content {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      padding: 2rem;
    }

    .change-password-card {
      width: 100%;
      max-width: 400px;
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .change-password-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .change-password-header h1 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .change-password-header p {
      color: #64748b;
      margin: 0.5rem 0 0;
      font-size: 0.875rem;
    }

    .change-password-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-field {
      position: relative;
    }

    .form-field label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }

    .form-field input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-field input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .error {
      color: #dc2626;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .change-password-button {
      width: 100%;
      padding: 0.75rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .change-password-button:hover:not(:disabled) {
      background: #2563eb;
    }

    .change-password-button:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .change-password-content {
        padding: 1rem;
      }

      .change-password-card {
        padding: 1.5rem;
      }
    }
  `]
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.changePasswordForm = this.fb.group({
      email: [{ value: this.authService.getCurrentUser()?.email || '', disabled: true }, [Validators.required, Validators.email]],
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit(): void {
    if (this.changePasswordForm.valid && !this.isLoading && this.authService.getCurrentUser()) {
      this.isLoading = true;
      const request: ChangePasswordRequest = {
        currentPassword: this.changePasswordForm.get('currentPassword')?.value,
        newPassword: this.changePasswordForm.get('newPassword')?.value,
        confirmPassword: this.changePasswordForm.get('confirmPassword')?.value
      };

      this.authService.changePassword(request).subscribe({
        next: (success) => {
          this.isLoading = false;
          if (success) {
            alert('Mot de passe changé avec succès');
            const role = this.authService.getCurrentUser()?.role;
            this.redirectUser(role);
          } else {
            alert('Échec du changement de mot de passe');
          }
        },
        error: (error) => {
          this.isLoading = false;
          alert(error.message || 'Erreur lors du changement de mot de passe');
        }
      });
    }
  }

  private redirectUser(role: string | undefined): void {
    switch (role) {
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'SUPPORT':
        this.router.navigate(['/agent/dashboard']);
        break;
      default:
        this.router.navigate(['/404']);
    }
  }}
