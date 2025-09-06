import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth.service';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
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
            <p class="login-subtitle">{{ 'auth.loginSubtitle' | translate }}</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <div class="form-field">
              <label>{{ getText('auth.email') }}</label>
              <input type="email" formControlName="email" autocomplete="email" [placeholder]="getText('auth.emailPlaceholder') || 'votre@email.com'">
              <div class="error" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                {{ getText('auth.emailError') || 'Email invalide' }}
              </div>
            </div>

            <div class="form-field">
              <label>{{ getText('auth.password') }}</label>
              <input [type]="hidePassword ? 'password' : 'text'" formControlName="password" autocomplete="current-password" [placeholder]="getText('auth.passwordPlaceholder') || 'Mot de passe'">
              <button type="button" class="toggle-password" (click)="hidePassword = !hidePassword">
                {{ hidePassword ? '👁️' : '🙈' }}
              </button>
              <div class="error" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                {{ getText('auth.passwordError') || 'Mot de passe requis' }}
              </div>
            </div>

            <div class="form-options">
              <label class="checkbox">
                <input type="checkbox" formControlName="rememberMe">
                <span>{{ getText('auth.rememberMe') }}</span>
              </label>
              <button type="button" (click)="onResetPassword()" class="forgot-link">{{ getText('auth.forgotPassword') }}</button>
            </div>

            <button 
              type="submit" 
              class="login-button"
              [disabled]="loginForm.invalid || isLoading">
              <span *ngIf="isLoading">{{ getText('auth.loggingIn') || 'Connexion...' }}</span>
              <span *ngIf="!isLoading">{{ getText('auth.login') }}</span>
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
  isLoading = false;
  hidePassword = true;
  availableLanguages = this.languageService.getAvailableLanguages();
  currentLanguage = this.languageService.getCurrentLanguage();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private languageService: LanguageService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Subscribe to language changes
    this.languageService.currentLanguage$.subscribe(language => {
      this.currentLanguage = language;
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const credentials = this.loginForm.value;
      console.log('Attempting login with credentials:', credentials);

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.isLoading = false;
          
          // Vérifier si l'utilisateur doit changer son mot de passe
          if (response.mustChangePassword) {
            console.log('User must change password, redirecting to change password page');
            this.router.navigate(['/auth/change-password']);
          } else {
            this.redirectUser(response.userType);
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.isLoading = false;
        }
      });
    }
  }

  onResetPassword(): void {
    // Implement password reset functionality
    console.log('Password reset requested');
  }

  changeLanguage(langCode: string): void {
    console.log('Changing language to:', langCode);
    this.languageService.setLanguage(langCode);
    this.currentLanguage = langCode;
  }

  getText(key: string): string {
    return this.languageService.getText(key);
  }

  private redirectUser(role: string): void {
    console.log('Redirecting user with role:', role);
    
    // Remove ROLE_ prefix if present
    const cleanRole = role.replace('ROLE_', '');
    console.log('Clean role:', cleanRole);
    
    switch (cleanRole) {
      case 'ADMIN':
        console.log('Redirecting to admin dashboard');
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'SUPPORT':
        console.log('Redirecting to support dashboard');
        this.router.navigate(['/support/dashboard']);
        break;
      default:
        alert('Accès non autorisé');
        console.log('Redirecting to default route');
        this.router.navigate(['/']);
    }
  }
}