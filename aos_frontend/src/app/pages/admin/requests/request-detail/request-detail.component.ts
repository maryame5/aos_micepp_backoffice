import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../../components/shared/page-header/page-header.component';
import { LoadingComponent } from '../../../../components/shared/loading/loading.component';
import { RequestService } from '../../../../services/request.service';

interface DocumentJustificatif {
  id: number;
  fileName: string;
  contentType: string;
  uploadedAt: string;
}

interface Demande {
  id: number;
  dateSoumission: string;
  statut: string;
  commentaire: string;
  documentReponse?: DocumentJustificatif;
  utilisateurId: number;
  utilisateurNom: string;
  utilisateurEmail: string;
  documentsJustificatifs: DocumentJustificatif[];
  serviceNom: string;
  serviceId: number;
  comments?: { userName: string; createdAt: string; content: string }[]; // Assuming comments structure
}

@Component({
  selector: 'app-admin-request-detail',
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
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatSnackBarModule,
    PageHeaderComponent,
    LoadingComponent
  ],
  template: `
    <div class="request-detail-container">
      <app-page-header 
        [title]="request?.serviceNom || 'Détail de la demande'" 
        subtitle="Consultez et gérez les détails de la demande">
        <div slot="actions">
          <button mat-stroked-button routerLink="/admin/requests">
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
                  <mat-chip [class]="getStatusClass(request.statut)">
                    {{ getStatusLabel(request.statut) }}
                  </mat-chip>
                </div>
                
                <div class="info-item">
                  <label>Date de création</label>
                  <span>{{ request.dateSoumission | date:'dd/MM/yyyy à HH:mm' }}</span>
                </div>

                <div class="info-item">
                  <label>Utilisateur</label>
                  <span>{{ request.utilisateurNom }} ({{ request.utilisateurEmail }})</span>
                </div>

                <div class="info-item">
                  <label>Service</label>
                  <span>{{ request.serviceNom }}</span>
                </div>
              </div>

              <mat-divider class="section-divider"></mat-divider>

              <div class="description-section">
                <h4>Commentaire</h4>
                <p>{{ request.commentaire }}</p>
              </div>

              <div class="service-data-section" *ngIf="serviceData">
                <h4>Données spécifiques du service</h4>
                <div *ngFor="let field of getServiceDataFields()">
                  <strong>{{ field.label }}:</strong> {{ field.value }}
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Documents -->
          <mat-card class="documents-card" *ngIf="request.documentsJustificatifs.length > 0">
            <mat-card-header>
              <mat-card-title>Documents joints</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="documents-list">
                <div class="document-item" *ngFor="let doc of request.documentsJustificatifs">
                  <mat-icon>{{ getFileIcon(doc.fileName) }}</mat-icon>
                  <div class="document-info">
                    <span class="document-name">{{ doc.fileName }}</span>
                  </div>
                  <button mat-icon-button (click)="downloadDocument(doc.id, request.id, doc.fileName)">
                    <mat-icon>download</mat-icon>
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Response Document -->
          <mat-card class="response-document-card" *ngIf="request.documentReponse">
            <mat-card-header>
              <mat-card-title>Document de réponse</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="document-item">
                <mat-icon>{{ getFileIcon(request.documentReponse.fileName) }}</mat-icon>
                <div class="document-info">
                  <span class="document-name">{{ request.documentReponse.fileName }}</span>
                </div>
                <button mat-icon-button (click)="downloadDocument(request.documentReponse.id, request.id, request.documentReponse.fileName)">
                  <mat-icon>download</mat-icon>
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Admin Controls -->
        <mat-card class="admin-controls-card">
          <mat-card-header>
            <mat-card-title>Gestion de la demande</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form (ngSubmit)="updateRequest()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nouveau statut</mat-label>
                <mat-select [(ngModel)]="newStatus" name="newStatus">
                  <mat-option value="EN_ATTENTE">En attente</mat-option>
                  <mat-option value="EN_COURS">En cours</mat-option>
                  <mat-option value="ACCEPTEE">Acceptée</mat-option>
                  <mat-option value="REFUSEE">Refusée</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Ajouter un commentaire</mat-label>
                <textarea matInput [(ngModel)]="newComment" name="newComment" rows="4"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Document de réponse</mat-label>
                <input matInput type="file" (change)="onFileSelected($event)" #fileInput style="display: none;">
                <button mat-raised-button (click)="fileInput.click()">Choisir fichier</button>
                <span *ngIf="selectedFile">{{ selectedFile.name }}</span>
              </mat-form-field>

              <button mat-raised-button color="primary" type="submit" [disabled]="isUpdating">Mettre à jour</button>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Comments/History -->
        <mat-card class="comments-card" *ngIf="request.comments && request.comments.length > 0">
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
        <button mat-raised-button color="primary" routerLink="/admin/requests">
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
    .comments-card,
    .admin-controls-card,
    .response-document-card {
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

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .mat-chip.status-en-attente {
      background-color: #fef3c7 !important;
      color: #92400e !important;
    }

    .mat-chip.status-en-cours {
      background-color: #dbeafe !important;
      color: #1e40af !important;
    }

    .mat-chip.status-acceptee {
      background-color: #d1fae5 !important;
      color: #065f46 !important;
    }

    .mat-chip.status-refusee {
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
export class AdminRequestDetailComponent implements OnInit {
  request: Demande | null = null;
  serviceData: any = null;
  isLoading = true;
  isUpdating = false;
  requestId: number | null = null;
  newStatus: string = '';
  newComment: string = '';
  selectedFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private requestService: RequestService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.requestId = parseInt(id, 10);
      this.loadRequest();
    }
  }

  loadRequest(): void {
    if (this.requestId) {
      this.requestService.getRequestById(this.requestId).subscribe({
        next: (request) => {
          this.request = request;
          this.newStatus = request.statut;
          this.isLoading = false;
          this.loadServiceData();
        },
        error: (error) => {
          console.error('Error loading request:', error);
          this.isLoading = false;
          this.snackBar.open('Erreur lors du chargement de la demande', 'Fermer', { duration: 5000 });
        }
      });
    }
  }

  loadServiceData(): void {
    if (this.requestId) {
      this.requestService.getDemandeServiceData(this.requestId).subscribe({
        next: (data) => {
          this.serviceData = data;
        },
        error: (error) => console.error('Error fetching service data:', error)
      });
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'ACCEPTEE': 'Acceptée',
      'REFUSEE': 'Refusée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace('_', '-')}`;
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf': return 'picture_as_pdf';
      case 'doc':
      case 'docx': return 'description';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'image';
      case 'txt': return 'article';
      default: return 'insert_drive_file';
    }
  }

  downloadDocument(documentId: number, demandeId: number, fileName: string): void {
    this.requestService.downloadDocument(demandeId, documentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading document:', error);
        this.snackBar.open('Erreur lors du téléchargement du document', 'Fermer', { duration: 5000 });
      }
    });
  }

  getServiceDataFields(): { label: string, value: any }[] {
    if (!this.serviceData) return [];
    return Object.entries(this.serviceData).map(([key, value]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      value
    }));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  updateRequest(): void {
    if (!this.requestId || !this.request) return;

    this.isUpdating = true;

    // Update status if changed
    if (this.newStatus !== this.request.statut) {
      this.requestService.updateRequestStatus(this.requestId, this.newStatus).subscribe({
        next: () => {
          if (this.request) this.request.statut = this.newStatus;
        },
        error: (error) => {
          console.error('Error updating status:', error);
          this.snackBar.open('Erreur lors de la mise à jour du statut', 'Fermer', { duration: 5000 });
        }
      });
    }

    // Add comment if provided
    if (this.newComment) {
      this.requestService.addComment(this.requestId, this.newComment).subscribe({
        next: (comment) => {
          if (this.request) {
            if (!this.request.comments) this.request.comments = [];
            this.request.comments.push(comment);
            this.newComment = '';
          }
        },
        error: (error) => {
          console.error('Error adding comment:', error);
          this.snackBar.open('Erreur lors de l\'ajout du commentaire', 'Fermer', { duration: 5000 });
        }
      });
    }

    // Upload response document if selected
    if (this.selectedFile) {
      this.requestService.uploadResponseDocument(this.requestId, this.selectedFile).subscribe({
        next: (doc) => {
          if (this.request) this.request.documentReponse = doc;
          this.selectedFile = null;
        },
        error: (error) => {
          console.error('Error uploading document:', error);
          this.snackBar.open('Erreur lors du téléchargement du document', 'Fermer', { duration: 5000 });
        }
      });
    }

    this.isUpdating = false;
    this.snackBar.open('Demande mise à jour avec succès', 'Fermer', { duration: 5000 });
  }
}