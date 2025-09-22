import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PageHeaderComponent } from '../../../../components/shared/page-header/page-header.component';
import { LoadingComponent } from '../../../../components/shared/loading/loading.component';
import { UserService } from '../../../../services/user.service';
import { UserDTO } from '../../../../models/user.model';
import { ConfirmDialogComponent } from '../../../../components/shared/confirm-dialog/confirm-dialog.component';

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
    MatMenuModule,
    PageHeaderComponent,
    LoadingComponent
  ],
  template: `
    <div class="user-details-container">
      <app-page-header 
        [title]="user?.lastname ? 'Détails de ' + user?.firstname + ' ' + user?.lastname : 'Détail de l\\'utilisateur'" 
        subtitle="Consultez et gérez les informations de l'utilisateur">
        <div slot="actions">
          <button mat-stroked-button routerLink="/admin/users">
            <mat-icon>arrow_back</mat-icon>
            Retour aux utilisateurs
          </button>
        </div>
      </app-page-header>

      <app-loading *ngIf="loading"></app-loading>

      <div class="user-content" *ngIf="!loading && user">
        <!-- Actions Card -->
        <mat-card class="actions-card">
          <mat-card-header>
            <mat-card-title>Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="action-buttons">
              <button 
                mat-raised-button 
                color="primary" 
                [routerLink]="['/admin', user.id, 'edit']">
                <mat-icon>edit</mat-icon>
                Modifier
              </button>
              

              <button 
                mat-raised-button 
                color="accent" 
                (click)="resetPassword()"
                [disabled]="loadingAction">
                <mat-icon>refresh</mat-icon>
                Réinitialiser mot de passe
              </button>
              
              <button 
                mat-raised-button 
                [color]="user.enabled ? 'warn' : 'primary'"
                (click)="toggleUserStatus()"
                [disabled]="loadingAction">
                <mat-icon>{{ user.enabled ? 'block' : 'check_circle' }}</mat-icon>
                {{ user.enabled ? 'Désactiver' : 'Activer' }}
              </button>

              <button 
                mat-button
                [matMenuTriggerFor]="moreMenu">
                <mat-icon>more_vert</mat-icon>
                Plus d'actions
              </button>
              
              <mat-menu #moreMenu="matMenu">
               
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="deleteUser()" class="delete-action">
                  <mat-icon>delete</mat-icon>
                  Supprimer l'utilisateur
                </button>
              </mat-menu>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- User Information Card -->
        <mat-card class="user-info-card">
          <mat-card-header>
            <mat-card-title>Informations de l'utilisateur</mat-card-title>
            <div class="status-badge" [class.active]="user.enabled" [class.inactive]="!user.enabled">
              {{ user.enabled ? 'Actif' : 'Inactif' }}
            </div>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <label>Nom complet</label>
                <span>{{ user.firstname }} {{ user.lastname }}</span>
              </div>
              <div class="info-item">
                <label>Email</label>
                <span>{{ user.email }}</span>
              </div>
              <div class="info-item">
                <label>Rôle</label>
                <span class="role-badge" [attr.data-role]="user.role">{{ getRoleLabel(user.role) }}</span>
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
              <div class="info-item">
                <label>Département</label>
                <span>{{ user.department }}</span>
              </div>
            </div>
            
            <mat-divider class="section-divider"></mat-divider>
            
            <div class="additional-info">
              <h4>Statut du compte</h4>
              <div class="status-info">
                <div class="status-item">
                  <mat-icon [class.warning]="user.usingTemporaryPassword">
                    {{ user.usingTemporaryPassword ? 'warning' : 'check_circle' }}
                  </mat-icon>
                  <span>
                    {{ user.usingTemporaryPassword 
                      ? 'Utilise un mot de passe temporaire' 
                      : 'Mot de passe permanent configuré' }}
                  </span>
                </div>
                <div class="status-item">
                  <mat-icon [class.success]="user.enabled" [class.error]="!user.enabled">
                    {{ user.enabled ? 'check_circle' : 'cancel' }}
                  </mat-icon>
                  <span>
                    Compte {{ user.enabled ? 'activé' : 'désactivé' }}
                  </span>
                </div>
              </div>
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
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .actions-card,
    .user-info-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .action-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
    }

    .action-buttons button {
      min-width: 160px;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.active {
      background-color: #d1fae5;
      color: #047857;
    }

    .status-badge.inactive {
      background-color: #fee2e2;
      color: #dc2626;
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

    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      background-color: #e5e7eb;
      color: #374151;
    }

    .role-badge[data-role="ADMIN"] {
      background-color: #fef3c7;
      color: #92400e;
    }

    .role-badge[data-role="SUPPORT"] {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .role-badge[data-role="AGENT"] {
      background-color: #d1fae5;
      color: #047857;
    }

    .section-divider {
      margin: 1.5rem 0;
    }

    .additional-info h4 {
      margin: 0 0 1rem 0;
      color: #374151;
      font-size: 1rem;
    }

    .status-info {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-item mat-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
    }

    .status-item mat-icon.warning {
      color: #f59e0b;
    }

    .status-item mat-icon.success {
      color: #10b981;
    }

    .status-item mat-icon.error {
      color: #ef4444;
    }

    .delete-action {
      color: #ef4444 !important;
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

      .action-buttons {
        flex-direction: column;
        align-items: stretch;
      }

      .action-buttons button {
        min-width: unset;
        width: 100%;
      }
    }
  `]
})
export class UserDetailsComponent implements OnInit {
  user: UserDTO | null = null;
  loading = true;
  loadingAction = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  private loadUser(): void {
    const userId = this.route.snapshot.paramMap.get('id')!;
    this.loading = true;
    
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load user:', err);
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement de l\'utilisateur', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  resetPassword(): void {
    if (!this.user) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Réinitialiser le mot de passe',
        message: `Êtes-vous sûr de vouloir réinitialiser le mot de passe de ${this.user.firstname} ${this.user.lastname} ? Un nouveau mot de passe temporaire sera envoyé par email.`,
        confirmText: 'Réinitialiser',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.user) {
        this.loadingAction = true;
        
        this.userService.resetUserPassword(this.user.id).subscribe({
          next: () => {
            this.loadingAction = false;
            this.snackBar.open('Mot de passe réinitialisé avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            // Recharger les données utilisateur
            this.loadUser();
          },
          error: (err) => {
            console.error('Failed to reset password:', err);
            this.loadingAction = false;
            this.snackBar.open('Erreur lors de la réinitialisation du mot de passe', 'Fermer', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  toggleUserStatus(): void {
    if (!this.user) return;

    const action = this.user.enabled ? 'désactiver' : 'activer';
    const actionPast = this.user.enabled ? 'désactivé' : 'activé';
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} l'utilisateur`,
        message: `Êtes-vous sûr de vouloir ${action} le compte de ${this.user.firstname} ${this.user.lastname} ?`,
        confirmText: action.charAt(0).toUpperCase() + action.slice(1),
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.user) {
        this.loadingAction = true;
        
        this.userService.toggleUserStatus(this.user.id, !this.user.enabled).subscribe({
          next: () => {
            this.loadingAction = false;
            this.snackBar.open(`Utilisateur ${actionPast} avec succès`, 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            // Recharger les données utilisateur
            this.loadUser();
          },
          error: (err) => {
            console.error('Failed to toggle user status:', err);
            this.loadingAction = false;
            this.snackBar.open(`Erreur lors de la ${action} de l'utilisateur`, 'Fermer', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }
  

  exportUserData(): void {
    // TODO: Implémenter l'export des données utilisateur
    this.snackBar.open('Fonctionnalité en cours de développement', 'Fermer', {
      duration: 2000
    });
  }

  viewUserActivity(): void {
    // TODO: Naviguer vers la page d'historique d'activité
    this.router.navigate(['/admin/users', this.user?.id, 'activity']);
  }

  deleteUser(): void {
    if (!this.user) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer l\'utilisateur',
        message: `⚠️ Attention ! Cette action est irréversible. Êtes-vous sûr de vouloir supprimer définitivement le compte de ${this.user.firstname} ${this.user.lastname} ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        isDestructive: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.user) {
        this.loadingAction = true;
        
        this.userService.deleteUser(this.user.id).subscribe({
          next: () => {
            this.snackBar.open('Utilisateur supprimé avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/admin/users']);
          },
          error: (err) => {
            console.error('Failed to delete user:', err);
            this.loadingAction = false;
            this.snackBar.open('Erreur lors de la suppression de l\'utilisateur', 'Fermer', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'ROLE_ADMIN': 'Administrateur',
      'ROLE_SUPPORT': 'Support',
      'ROLE_AGENT': 'Agent',
      'ADMIN': 'Administrateur',
      'SUPPORT': 'Support',
      'AGENT': 'Agent'
    };
    return labels[role] || role;
  }
}