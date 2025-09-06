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
import { AuthService } from '../../../../services/auth.service';

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
  description: string;
  documentReponse?: DocumentJustificatif;
  utilisateurId: number;
  utilisateurNom: string;
  utilisateurEmail: string;
  documentsJustificatifs: DocumentJustificatif[];
  serviceNom: string;
  serviceId: number;
  assignedToId?: number | null;
  assignedToUsername?: string | null;
  commentaire?: string;
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
                <h4>Description</h4>
                <p>{{ request.description }}</p>
              </div>

              <div class="comment-section" *ngIf="request.commentaire">
                <h4>Commentaire de l'admin</h4>
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
                  <ng-container *ngIf="doc.contentType !== 'justificatif'">
                    <mat-icon>{{ getFileIcon(doc.fileName) }}</mat-icon>
                    <div class="document-info">
                      <span class="document-name">{{ doc.fileName }}</span>
                    </div>
                    <button mat-icon-button (click)="downloadDocument(doc.id, request.id, doc.fileName)">
                      <mat-icon>download</mat-icon>
                    </button>
                  </ng-container>
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
        <mat-card class="admin-controls-card" *ngIf="isAssignedToCurrentUser()">
          <mat-card-header>
            <mat-card-title>Gestion de la demande</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form (ngSubmit)="updateRequest()">
              <mat-form-field class="full-width">
                <mat-label>Nouveau statut</mat-label>
                <mat-select [(ngModel)]="newStatus" name="newStatus">
                  <mat-option value="EN_ATTENTE">En attente</mat-option>
                  <mat-option value="EN_COURS">En cours</mat-option>
                  <mat-option value="ACCEPTEE">Acceptée</mat-option>
                  <mat-option value="REFUSEE">Refusée</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field class="full-width">
                <mat-label>Ajouter un commentaire</mat-label>
                <textarea matInput [(ngModel)]="newComment" name="newComment" rows="4"  ></textarea>
              </mat-form-field>

              <mat-form-field class="full-width">
                <mat-label>Documents de réponse</mat-label>
                <input matInput type="file" multiple (change)="onFileSelected($event)" #fileInput style="display: none;">
                <button mat-raised-button (click)="fileInput.click()">Choisir fichiers</button>
                <span *ngIf="selectedFiles.length > 0">{{ selectedFiles.length }} fichier(s) sélectionné(s)</span>
              </mat-form-field>

              <div class="uploaded-files" *ngIf="selectedFiles.length > 0">
                <h4>Fichiers sélectionnés ({{ selectedFiles.length }})</h4>
                <div class="file-list">
                  <div class="file-item" *ngFor="let file of selectedFiles; let i = index">
                    <mat-icon>{{ getFileIcon(file.name) }}</mat-icon>
                    <div class="file-info">
                      <span class="file-name">{{ file.name }}</span>
                    </div>
                    <button mat-icon-button (click)="removeFile(i)" color="warn">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
              </div>

              <button mat-raised-button color="primary" type="submit" [disabled]="isUpdating">Mettre à jour</button>
            </form>
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

    .comment-section h4 {
      margin: 0 0 1rem 0;
      color: #374151;
      font-size: 1rem;
    }

    .comment-section p {
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

    .uploaded-files h4 {
      margin: 0 0 1rem 0;
      color: #374151;
    }

    .file-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
    }

    .file-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .file-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
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
  selectedFiles: File[] = [];

  constructor(
    private route: ActivatedRoute,
    private requestService: RequestService,
    private authService: AuthService,
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
          this.newComment = request.commentaire || '';
          this.selectedFiles = [];
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
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        if (!this.isValidFileType(file)) {
          this.snackBar.open(`Type de fichier non supporté: ${file.name}`, 'Fermer', { duration: 3000 });
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          this.snackBar.open(`Fichier trop volumineux: ${file.name} (max 10MB)`, 'Fermer', { duration: 3000 });
          continue;
        }
        if (this.selectedFiles.some(f => f.name === file.name)) {
          this.snackBar.open(`Fichier déjà sélectionné: ${file.name}`, 'Fermer', { duration: 3000 });
          continue;
        }
        this.selectedFiles.push(file);
      }
    }
  }

  private isValidFileType(file: File): boolean {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'text/plain'
    ];
    return allowedTypes.includes(file.type);
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  isAssignedToCurrentUser(): boolean {
    if (!this.request || !this.request.assignedToId) return false;
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    return parseInt(currentUser.id) === this.request.assignedToId;
  }

  updateRequest(): void {
    if (!this.requestId || !this.request) return;

    this.isUpdating = true;

    const comment = this.newComment;
    // Call the consolidated updateRequest method
    this.requestService.updateRequest(this.requestId, this.newStatus, comment, this.selectedFiles).subscribe({
      next: (updatedRequest) => {
        this.request = updatedRequest;
        this.newStatus = updatedRequest.statut;
        this.newComment = updatedRequest.commentaire || '';
        this.selectedFiles = [];
        this.isUpdating = false;
        this.snackBar.open('Demande mise à jour avec succès', 'Fermer', { duration: 5000 });
      },
      error: (error) => {
        console.error('Error updating request:', error);
        this.isUpdating = false;
        this.snackBar.open('Erreur lors de la mise à jour de la demande', 'Fermer', { duration: 5000 });
      }
    });
  }
}