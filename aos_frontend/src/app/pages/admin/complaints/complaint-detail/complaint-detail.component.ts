import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../../components/shared/page-header/page-header.component';
import { LoadingComponent } from '../../../../components/shared/loading/loading.component';
import { ReclamationService, Reclamation } from '../../../../services/reclamation.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-admin-complaint-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatSnackBarModule,
    PageHeaderComponent,
    LoadingComponent
  ],
  template: `
    <div class="complaint-detail-container">
      <app-page-header 
        [title]="complaint?.objet || 'Détail de la réclamation'" 
        subtitle="Consultez et gérez les détails de la réclamation">
        <div slot="actions">
          <button mat-stroked-button routerLink="/admin/complaints">
            <mat-icon>arrow_back</mat-icon>
            Retour aux réclamations
          </button>
        </div>
      </app-page-header>

      <app-loading *ngIf="isLoading"></app-loading>

      <div class="complaint-content" *ngIf="!isLoading && complaint">
        <mat-card class="complaint-info-card">
          <mat-card-header>
            <mat-card-title>Informations générales</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <label>Statut</label>
                <mat-chip [class]="getStatusClass(complaint.statut)">
                  {{ getStatusLabel(complaint.statut) }}
                </mat-chip>
              </div>
              <div class="info-item">
                <label>Date de soumission</label>
                <span>{{ complaint.dateSoumission | date:'dd/MM/yyyy à HH:mm' }}</span>
              </div>
              <div class="info-item">
                <label>Utilisateur</label>
                <span>{{ complaint.utilisateur.firstName }} {{ complaint.utilisateur.lastName }} ({{ complaint.utilisateur.email }})</span>
              </div>
              <div class="info-item" *ngIf="complaint.assignedTo">
                <label>Assigné à</label>
                <span>{{ complaint.assignedTo.firstName }} {{ complaint.assignedTo.lastName }} ({{ complaint.assignedTo.email }})</span>
              </div>
            </div>

            <mat-divider class="section-divider"></mat-divider>

            <div class="description-section">
              <h4>Contenu</h4>
              <p>{{ complaint.contenu }}</p>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Admin Controls -->
        <mat-card class="admin-controls-card" *ngIf="isAssignedToCurrentUser()">
          <mat-card-header>
            <mat-card-title>Gestion de la réclamation</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form (ngSubmit)="updateComplaint()" class="complaint-form">
              <div class="form-row">
                <mat-form-field class="status-field">
                  <mat-label>Nouveau statut</mat-label>
                  <mat-select [(ngModel)]="newStatus" name="newStatus">
                    <mat-option value="SOUMISE">Soumise</mat-option>
                    <mat-option value="AFFECTEE">Affectée</mat-option>
                    <mat-option value="EN_COURS">En cours</mat-option>
                    <mat-option value="RESOLUE">Résolue</mat-option>
                    <mat-option value="FERMEE">Fermée</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field class="comment-field">
                  <mat-label>Ajouter un commentaire</mat-label>
                  <textarea matInput [(ngModel)]="newComment" name="newComment" rows="6" placeholder="Entrez votre commentaire ici..."></textarea>
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-raised-button color="primary" type="submit" [disabled]="isUpdating" class="update-button">
                  <mat-icon *ngIf="!isUpdating">save</mat-icon>
                  <mat-icon *ngIf="isUpdating" class="spinning">refresh</mat-icon>
                  {{ isUpdating ? 'Mise à jour...' : 'Mettre à jour' }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="empty-state" *ngIf="!isLoading && !complaint">
        <mat-icon class="empty-icon">report_problem</mat-icon>
        <h3>Réclamation non trouvée</h3>
        <p>La réclamation que vous recherchez n'existe pas ou a été supprimée.</p>
        <button mat-raised-button color="primary" routerLink="/admin/complaints">
          Retour aux réclamations
        </button>
      </div>
    </div>
  `,
  styles: [`
    .complaint-detail-container {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
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

    .description-section h4 {
      margin: 0 0 1rem 0;
      color: #374151;
      font-size: 1rem;
    }

    .description-section p {
      margin: 0;
      color: #6b7280;
      line-height: 1.6;
    }

    .admin-controls-card {
      margin-top: 2rem;
      border-radius: 12px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-left: 4px solid #3b82f6 !important;
    }

    .complaint-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-row {
      width: 100%;
    }

    .status-field {
      width: 100%;
      min-height: 56px;
    }

    .comment-field {
      width: 100%;
      min-height: 120px;
    }

    .comment-field textarea {
      min-height: 100px;
      resize: vertical;
    }

    .form-actions {
      margin-top: 2rem;
      display: flex;
      justify-content: flex-end;
    }

    .update-button {
      min-width: 140px;
      height: 48px;
      font-size: 1rem;
      font-weight: 500;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .complaint-form {
        gap: 1rem;
      }

      .form-actions {
        justify-content: center;
      }

      .update-button {
        width: 100%;
      }
    }
  `]
})
export class AdminComplaintDetailComponent implements OnInit {
  complaint: Reclamation | null = null;
  isLoading = true;
  isUpdating = false;
  newStatus: string = '';
  newComment: string = '';
  complaintId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private reclamationService: ReclamationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.complaintId = parseInt(id, 10);
      this.loadComplaint();
    }
  }

  loadComplaint(): void {
    if (this.complaintId) {
      this.reclamationService.getComplaintById(this.complaintId).subscribe({
        next: (complaint) => {
          this.complaint = complaint;
          this.newStatus = complaint.statut;
          this.newComment = complaint.commentaire || '';
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading complaint:', error);
          this.isLoading = false;
          this.snackBar.open('Erreur lors du chargement de la réclamation', 'Fermer', { duration: 5000 });
        }
      });
    }
  }

  isAssignedToCurrentUser(): boolean {
    if (!this.complaint || !this.complaint.assignedTo) return false;
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    return parseInt(currentUser.id) === this.complaint.assignedTo.id;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'SOUMISE': 'Soumise',
      'AFFECTEE': 'Affectée',
      'EN_COURS': 'En cours',
      'RESOLUE': 'Résolue',
      'FERMEE': 'Fermée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: Record<string, string> = {
      'SOUMISE': 'status-soumise',
      'AFFECTEE': 'status-affectee',
      'EN_COURS': 'status-en-cours',
      'RESOLUE': 'status-resolue',
      'FERMEE': 'status-fermee'
    };
    return classMap[status] || 'status-soumise';
  }

  updateComplaint(): void {
    if (!this.complaintId) return;

    this.isUpdating = true;
    this.reclamationService.updateComplaint(this.complaintId, this.newStatus, this.newComment).subscribe({
      next: (updatedComplaint) => {
        this.complaint = updatedComplaint;
        this.isUpdating = false;
        this.snackBar.open('Réclamation mise à jour avec succès', 'Fermer', { duration: 5000 });
      },
      error: (error) => {
        console.error('Error updating complaint:', error);
        this.isUpdating = false;
        this.snackBar.open('Erreur lors de la mise à jour de la réclamation', 'Fermer', { duration: 5000 });
      }
    });
  }
}
