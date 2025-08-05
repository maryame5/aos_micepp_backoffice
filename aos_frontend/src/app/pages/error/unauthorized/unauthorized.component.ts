import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="error-container">
      <div class="error-content">
        <mat-icon class="error-icon">block</mat-icon>
        <h1 class="error-title">Accès non autorisé</h1>
        <p class="error-message">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <div class="error-actions">
          <button mat-raised-button color="primary" routerLink="/">
            <mat-icon>home</mat-icon>
            Retour à l'accueil
          </button>
          <button mat-stroked-button routerLink="/auth/login">
            <mat-icon>login</mat-icon>
            Se connecter
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .error-content {
      text-align: center;
      color: white;
      max-width: 500px;
    }

    .error-icon {
      font-size: 6rem;
      width: 6rem;
      height: 6rem;
      margin-bottom: 2rem;
      opacity: 0.8;
    }

    .error-title {
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .error-message {
      font-size: 1.125rem;
      margin-bottom: 2rem;
      opacity: 0.9;
      line-height: 1.6;
    }

    .error-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .error-actions button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    @media (max-width: 768px) {
      .error-title {
        font-size: 2rem;
      }

      .error-actions {
        flex-direction: column;
        align-items: center;
      }

      .error-actions button {
        width: 200px;
      }
    }
  `]
})
export class UnauthorizedComponent {}