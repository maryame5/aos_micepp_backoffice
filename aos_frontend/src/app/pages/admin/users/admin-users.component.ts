import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, PageHeaderComponent],
  template: `
    <div class="users-container">
      <app-page-header 
        title="Gestion des Utilisateurs" 
        subtitle="Gérez les comptes utilisateurs de la plateforme">
        <div slot="actions">
          <button mat-raised-button color="primary" routerLink="/admin/users/add">
            <mat-icon>person_add</mat-icon>
            Nouvel utilisateur
          </button>
        </div>
      </app-page-header>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Liste des utilisateurs</mat-card-title>
          <mat-card-subtitle>Consultez et gérez tous les comptes utilisateurs</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="users-content">
            <div class="placeholder-content">
              <mat-icon class="placeholder-icon">people</mat-icon>
              <h3>Gestion des utilisateurs</h3>
              <p>Cette page permet de consulter et gérer tous les utilisateurs de la plateforme.</p>
              <p>Cliquez sur "Nouvel utilisateur" pour créer un nouveau compte.</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .users-container {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .users-content {
      padding: 2rem 0;
    }

    .placeholder-content {
      text-align: center;
      color: #64748b;
    }

    .placeholder-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .placeholder-content h3 {
      margin: 1rem 0;
      color: #374151;
    }

    .placeholder-content p {
      margin: 0.5rem 0;
      line-height: 1.6;
    }
  `]
})
export class AdminUsersComponent {}