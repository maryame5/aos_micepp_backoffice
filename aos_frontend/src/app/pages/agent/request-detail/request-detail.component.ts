import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';
import { LoadingComponent } from '../../../components/shared/loading/loading.component';
import { RequestService } from '../../../services/request.service';
import { ServiceRequest, RequestStatus } from '../../../models/request.model';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatDividerModule,
    PageHeaderComponent,
    LoadingComponent
  ],
  template: `
    <div class="request-detail-container">
      <app-page-header 
        [title]="request?.title || 'Détail de la demande'" 
        subtitle="Consultez les détails et le suivi de votre demande">
        <div slot="actions">
          <button mat-stroked-button routerLink="/agent/requests">
            <mat-icon>arrow_back</mat-icon>
            Retour aux demandes
          </button>
        </div>
      </app-page-header>

      <app-loading *ngIf="isLoading"></app-loading>

      <div class="request-content" *ngIf="!isLoading && request">
        <div class="request-grid">
          <!-- Main Request Info -->
          <mat-card class="request-info-card">
            <mat-card-header>
              <mat-card-title>Informations générales</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <label>Statut</label>
                  <mat-chip [class]="getStatusClass(request.status)">
                    {{ getStatusLabel(request.status) }}
                  </mat-chip>
                </div>
                
                <div class="info-item">
                  <label>Priorité</label>
                  <mat-chip [class]="getPriorityClass(request.priority)">
                    {{ getPriorityLabel(request.priority) }}
                  </mat-chip>
                </div>

                <div class="info-item">
                  <label>Date de création</label>
                  <span>{{ request.createdAt | date:'dd/MM/yyyy à HH:mm' }}</span>
                </div>

                <div class="info-item" *ngIf="request.updatedAt !== request.createdAt">
                  <label>Dernière modification</label>
                  <span>{{ request.updatedAt | date:'dd/MM/yyyy à HH:mm' }}</span>
                </div>

                <div class="info-item" *ngIf="request.dueDate">
                  <label>Date d'échéance</label>
                  <span>{{ request.dueDate | date:'dd/MM/yyyy' }}</span>
                </div>

                <div class="info-item" *ngIf="request.assignedTo">
                  <label>Assigné à</label>
                  <span>{{ request.assignedTo }}</span>
                </div>
              </div>

              <mat-divider class="section-divider"></mat-divider>

              <div class="description-section">
                <h4>Description</h4>
                <p>{{ request.description }}</p>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Documents -->
          <mat-card class="documents-card" *ngIf="request.documents.length > 0">
            <mat-card-header>
              <mat-card-title>Documents joints</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="documents-list">
                <div class="document-item" *ngFor="let doc of request.documents">
                  <mat-icon>description</mat-icon>
                  <div class="document-info">
                    <span class="document-name">{{ doc.name }}</span>
                    <span class="document-size">{{ formatFileSize(doc.size) }}</span>
                  </div>
                  <button mat-icon-button>
                    <mat-icon>download</mat-icon>
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Comments/History -->
        <mat-card class="comments-card" *ngIf="request.comments.length > 0">
          <mat-card-header>
            <mat-card-title>Historique et commentaires</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="comments-list">
              <div class="comment-item" *ngFor="let comment of request.comments">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.userName }}</span>
                  <span class="comment-date">{{ comment.createdAt | date:'dd/MM/yyyy à HH:mm' }}</span>
                </div>
                <p class="comment-content">{{ comment.content }}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="empty-state" *ngIf="!isLoading && !request">
        <mat-icon class="empty-icon">assignment</mat-icon>
        <h3>Demande non trouvée</h3>
        <p>La demande que vous recherchez n'existe pas ou a été supprimée.</p>
        <button mat-raised-button color="primary" routerLink="/agent/requests">
          Retour aux demandes
        </button>
      </div>
    </div>
  `,
  styles: [`
    .request-detail-container {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .request-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .request-info-card,
    .documents-card,
    .comments-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .document-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }

    .document-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .document-name {
      font-weight: 500;
      color: #374151;
    }

    .document-size {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .comment-item {
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .comment-author {
      font-weight: 600;
      color: #374151;
    }

    .comment-date {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .comment-content {
      margin: 0;
      color: #6b7280;
      line-height: 1.6;
    }

    .mat-chip.status-pending {
      background-color: #fef3c7 !important;
      color: #92400e !important;
    }

    .mat-chip.status-in-progress {
      background-color: #dbeafe !important;
      color: #1e40af !important;
    }

    .mat-chip.status-completed,
    .mat-chip.status-approved {
      background-color: #d1fae5 !important;
      color: #065f46 !important;
    }

    .mat-chip.status-rejected {
      background-color: #fee2e2 !important;
      color: #991b1b !important;
    }

    .mat-chip.priority-low {
      background-color: #d1fae5 !important;
      color: #065f46 !important;
    }

    .mat-chip.priority-medium {
      background-color: #fef3c7 !important;
      color: #92400e !important;
    }

    .mat-chip.priority-high,
    .mat-chip.priority-urgent {
      background-color: #fee2e2 !important;
      color: #991b1b !important;
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
      .request-detail-container {
        padding: 0.5rem;
      }

      .request-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RequestDetailComponent implements OnInit {
  request: ServiceRequest | null = null;
  isLoading = true;
  requestId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private requestService: RequestService
  ) {}

  ngOnInit(): void {
    this.requestId = this.route.snapshot.paramMap.get('id');
    if (this.requestId) {
      this.loadRequest();
    }
  }

  loadRequest(): void {
    if (this.requestId) {
      this.requestService.getRequestById(this.requestId).subscribe({
        next: (request) => {
          this.request = request || null;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading request:', error);
          this.isLoading = false;
        }
      });
    }
  }

  getStatusLabel(status: RequestStatus): string {
    const labels: Record<RequestStatus, string> = {
      [RequestStatus.PENDING]: 'En attente',
      [RequestStatus.IN_PROGRESS]: 'En cours',
      [RequestStatus.APPROVED]: 'Approuvée',
      [RequestStatus.REJECTED]: 'Rejetée',
      [RequestStatus.COMPLETED]: 'Terminée'
    };
    return labels[status];
  }

  getStatusClass(status: RequestStatus): string {
    return `status-${status.toLowerCase().replace('_', '-')}`;
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      'LOW': 'Faible',
      'MEDIUM': 'Normale',
      'HIGH': 'Élevée',
      'URGENT': 'Urgente'
    };
    return labels[priority] || priority;
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}