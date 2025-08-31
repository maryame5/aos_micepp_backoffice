import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PageHeaderComponent } from '../../../../components/shared/page-header/page-header.component';
import { LoadingComponent } from '../../../../components/shared/loading/loading.component';
import { UserService } from '../../../../services/user.service';
import { UserDTO } from '../../../../models/user.model';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    PageHeaderComponent,
    LoadingComponent
  ],
  template: `
    <div class="user-details-container">
      <app-page-header 
        [title]="user?.username ? 'Détails de ' + user?.username : 'Détail de l\\'utilisateur'" 
        subtitle='Consultez les informations de l´utilisateur'>
        <div slot="actions">
          <button mat-stroked-button routerLink="/admin/users">
            <mat-icon>arrow_back</mat-icon>
            Retour aux utilisateurs
          </button>
        </div>
      </app-page-header>

      <app-loading *ngIf="loading"></app-loading>

      <div class="user-content" *ngIf="!loading && user">
        <mat-card class="user-info-card">
          <mat-card-header>
            <mat-card-title>Informations de l'utilisateur</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <label>Nom d'utilisateur</label>
                <span>{{ user.username }}</span>
              </div>
              <div class="info-item">
                <label>Email</label>
                <span>{{ user.email }}</span>
              </div>
              <div class="info-item">
                <label>Rôle</label>
                <span>{{ getRoleLabel(user.role) }}</span>
              </div>
              <div class="info-item">
                <label>Téléphone</label>
                <span>{{ user.phone || 'Non spécifié' }}</span>
              </div>
              <div class="info-item">
                <label>CIN</label>
                <span>{{ user.cin || 'Non spécifié' }}</span>
              </div>
              <div class="info-item">
                <label>Matricule</label>
                <span>{{ user.matricule || 'Non spécifié' }}</span>
              </div>
            </div>
            <mat-divider class="section-divider"></mat-divider>
            <div class="additional-info">
              <h4>Informations supplémentaires</h4>
              <p *ngIf="user.usingTemporaryPassword" class="temporary-password">
                Cet utilisateur utilise un mot de passe temporaire.
              </p>
              <p *ngIf="!user.usingTemporaryPassword">
                Compte activé avec un mot de passe permanent.
              </p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="empty-state" *ngIf="!loading && !user">
        <mat-icon class="empty-icon">person</mat-icon>
        <h3>Utilisateur non trouvé</h3>
        <p>L'utilisateur que vous recherchez n'existe pas ou a été supprimé.</p>
        <button mat-raised-button color="primary" routerLink="/admin/users">
          Retour aux utilisateurs
        </button>
      </div>
    </div>
  `,
  styles: [`
    .user-details-container {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .user-content {
      margin-bottom: 2rem;
    }

    .user-info-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
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

    .section-divider {
      margin: 1.5rem 0;
    }

    .additional-info h4 {
      margin: 0 0 1rem 0;
      color: #374151;
      font-size: 1rem;
    }

    .additional-info p {
      margin: 0;
      color: #6b7280;
      line-height: 1.6;
    }

    .temporary-password {
      color: #f59e0b;
      font-weight: 500;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      color: #64748b;
    }

    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 1rem 0;
      color: #374151;
    }

    .empty-state p {
      margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
      .user-details-container {
        padding: 0.5rem;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UserDetailsComponent implements OnInit {
  user: UserDTO | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id')!;
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load user:', err);
        this.loading = false;
      }
    });
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'ROLE_ADMIN': 'Administrateur',
      'ROLE_SUPPORT': 'Support',
      'ROLE_AGENT': 'Agent'
    };
    return labels[role] || role;
  }
}