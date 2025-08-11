import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-background"></div>
      
      <div class="login-content">
        <div class="login-card">
          <div class="login-header">
            <div class="logo">
              <div class="logo-icon">🏢</div>
              <h1>AOS MICEPP</h1>
            </div>
            <p class="login-subtitle">Connectez-vous à votre espace</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <div class="form-field">
              <label>Adresse email</label>
              <input type="email" formControlName="email" autocomplete="email" placeholder="votre@email.com">
              <div class="error" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                Email invalide
              </div>
            </div>

            <div class="form-field">
              <label>Mot de passe</label>
              <input [type]="hidePassword ? 'password' : 'text'" formControlName="password" autocomplete="current-password" placeholder="Mot de passe">
              <button type="button" class="toggle-password" (click)="hidePassword = !hidePassword">
                {{ hidePassword ? '👁️' : '🙈' }}
              </button>
              <div class="error" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                Mot de passe requis
              </div>
            </div>

            <div class="form-options">
              <label class="checkbox">
                <input type="checkbox" formControlName="rememberMe">
                <span>Se souvenir de moi</span>
              </label>
              <button type="button" (click)="onResetPassword()" class="forgot-link">Mot de passe oublié ?</button>
            </div>

            <button 
              type="submit" 
              class="login-button"
              [disabled]="loginForm.invalid || isLoading">
              <span *ngIf="isLoading">Connexion...</span>
              <span *ngIf="!isLoading">Se connecter</span>
            </button>
          </form>

          <div class="language-selector">
            <button 
              *ngFor="let lang of availableLanguages" 
              (click)="changeLanguage(lang.code)"
              class="lang-btn"
              [class.active]="currentLanguage === lang.code">
              {{ lang.flag }} {{ lang.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      position: relative;
      overflow: hidden;
    }

    .login-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      z-index: 0;
    }

    .login-content {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      padding: 2rem;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .login-header {
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
    }

    .logo h1 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .login-subtitle {
      color: #64748b;
      margin: 0;
      font-size: 0.875rem;
    }

    .login-form {
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

    .toggle-password {
      position: absolute;
      right: 0.75rem;
      top: 2.5rem;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
    }

    .error {
      color: #dc2626;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0.5rem 0;
    }

    .checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .checkbox input {
      width: auto;
    }

    .forgot-link {
      color: #3b82f6;
      text-decoration: none;
      font-size: 0.875rem;
    }

    .forgot-link:hover {
      text-decoration: underline;
    }

    .login-button {
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

    .login-button:hover:not(:disabled) {
      background: #2563eb;
    }

    .login-button:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .demo-accounts {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
      text-align: center;
    }

    .demo-title {
      font-size: 0.875rem;
      color: #64748b;
      margin-bottom: 1rem;
    }

    .demo-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .demo-btn {
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      color: #374151;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.75rem;
      transition: all 0.3s ease;
    }

    .demo-btn:hover {
      background: #e5e7eb;
    }

    .demo-password {
      font-size: 0.75rem;
      color: #9ca3af;
      margin-top: 0.5rem;
    }

    .language-selector {
      margin-top: 2rem;
      display: flex;
      gap: 0.5rem;
    }

    .lang-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.875rem;
    }

    .lang-btn:hover,
    .lang-btn.active {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.4);
    }

    @media (max-width: 768px) {
      .login-content {
        padding: 1rem;
      }

      .login-card {
        padding: 1.5rem;
      }

      .language-selector {
        flex-direction: column;
        width: 100%;
        max-width: 400px;
        gap: 0.25rem;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  isLoading = false;
  currentLanguage: string;
  availableLanguages = this.languageService.getAvailableLanguages();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private languageService: LanguageService,
    private router: Router
  ) {
    this.currentLanguage = this.languageService.getCurrentLanguage();
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      const credentials = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          alert('Connexion réussie');
          if (response.mustChangePassword) {
            this.router.navigate(['/auth/change-password']);
          } else {
            this.redirectUser(response.userType);
          }
        },
        error: (error) => {
          this.isLoading = false;
          alert(error.message || 'Erreur lors de la connexion');
        }
      });
    }
  }

  onResetPassword(): void {
    const email = this.loginForm.get('email')?.value;
    if (!email) {
      alert('Veuillez entrer votre email.');
      return;
    }
    this.authService.resetPassword(email).subscribe({
      next: (message) => {
        alert(message); // Shows "Please contact the administration to reset your password."
      },
      error: (error) => {
        alert(error.message || 'Erreur lors de la réinitialisation du mot de passe');
      }
    });
  }

  changeLanguage(langCode: string): void {
    this.languageService.setLanguage(langCode);
    this.currentLanguage = langCode;
  }

  private redirectUser(role: string): void {
    switch (role) {
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'SUPPORT':
        this.router.navigate(['/agent/dashboard']);
        break;
      case 'AGENT':
        this.router.navigate(['/agent/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}