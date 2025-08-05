import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';
import { LoadingComponent } from '../../../components/shared/loading/loading.component';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  size: number;
  downloadUrl: string;
  uploadedAt: Date;
  description?: string;
}

@Component({
  selector: 'app-agent-documents',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    PageHeaderComponent,
    LoadingComponent
  ],
 
  template: `
    <div class="documents-container">
      <app-page-header 
        title="Mes Documents" 
        subtitle="Consultez et téléchargez vos documents">
        <div slot="actions">
          <button mat-raised-button color="primary" (click)="uploadDocument()">
            <mat-icon>cloud_upload</mat-icon>
            Téléverser un document
          </button>
        </div>
      </app-page-header>

      <app-loading *ngIf="isLoading"></app-loading>

      <div class="documents-content" *ngIf="!isLoading">
        <!-- Filters -->
        <mat-card class="filters-card">
          <div class="filters-container">
            <mat-form-field appearance="outline">
              <mat-label>Rechercher</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Nom du document...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Catégorie</mat-label>
              <mat-select [(value)]="selectedCategory" (selectionChange)="applyFilters()">
                <mat-option value="">Toutes les catégories</mat-option>
                <mat-option value="Attestations">Attestations</mat-option>
                <mat-option value="Justificatifs">Justificatifs</mat-option>
                <mat-option value="Formulaires">Formulaires</mat-option>
                <mat-option value="Certificats">Certificats</mat-option>
                <mat-option value="Autres">Autres</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Type de fichier</mat-label>
              <mat-select [(value)]="selectedType" (selectionChange)="applyFilters()">
                <mat-option value="">Tous les types</mat-option>
                <mat-option value="PDF">PDF</mat-option>
                <mat-option value="DOC">Word</mat-option>
                <mat-option value="JPG">Image</mat-option>
                <mat-option value="ZIP">Archive</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-icon-button (click)="clearFilters()" title="Effacer les filtres">
              <mat-icon>clear</mat-icon>
            </button>
          </div>
        </mat-card>

        <!-- Documents Grid -->
        <div class="documents-grid" *ngIf="filteredDocuments.length > 0; else noDocuments">
          <mat-card class="document-card" *ngFor="let document of filteredDocuments">
            <div class="document-icon">
              <mat-icon [class]="getFileIconClass(document.type)">
                {{ getFileIcon(document.type) }}
              </mat-icon>
            </div>
            
            <mat-card-header>
              <mat-card-title>{{ document.name }}</mat-card-title>
              <mat-card-subtitle>{{ document.category }}</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <p class="document-description" *ngIf="document.description">
                {{ document.description }}
              </p>
              
              <div class="document-meta">
                <div class="meta-item">
                  <mat-icon>insert_drive_file</mat-icon>
                  <span>{{ document.type }}</span>
                </div>
                <div class="meta-item">
                  <mat-icon>storage</mat-icon>
                  <span>{{ formatFileSize(document.size) }}</span>
                </div>
                <div class="meta-item">
                  <mat-icon>event</mat-icon>
                  <span>{{ document.uploadedAt | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button (click)="downloadDocument(document)" color="primary">
                <mat-icon>download</mat-icon>
                Télécharger
              </button>
              <button mat-button (click)="viewDocument(document)">
                <mat-icon>visibility</mat-icon>
                Aperçu
              </button>
              <button mat-icon-button (click)="shareDocument(document)" title="Partager">
                <mat-icon>share</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <ng-template #noDocuments>
          <mat-card class="empty-state-card">
            <div class="empty-state">
              <mat-icon class="empty-icon">description</mat-icon>
              <h3>Aucun document trouvé</h3>
              <p *ngIf="hasActiveFilters()">Essayez de modifier vos critères de recherche</p>
              <p *ngIf="!hasActiveFilters()">Vous n'avez pas encore de documents</p>
              <button mat-raised-button color="primary" (click)="uploadDocument()">
                <mat-icon>cloud_upload</mat-icon>
                Téléverser mon premier document
              </button>
            </div>
          </mat-card>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .documents-container {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .documents-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .filters-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .filters-container {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
      padding: 1rem;
    }

    .filters-container mat-form-field {
      min-width: 200px;
    }

    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .document-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .document-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .document-icon {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .document-icon mat-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .file-pdf {
      color: #dc2626;
    }

    .file-doc {
      color: #2563eb;
    }

    .file-image {
      color: #059669;
    }

    .file-archive {
      color: #7c3aed;
    }

    .file-default {
      color: #6b7280;
    }

    .document-description {
      color: #6b7280;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }

    .document-meta {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .meta-item mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .empty-state-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
      .documents-container {
        padding: 0.5rem;
      }

      .filters-container {
        flex-direction: column;
        align-items: stretch;
      }

      .filters-container mat-form-field {
        width: 100%;
        min-width: unset;
      }

      .documents-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }
  `]
})
export class AgentDocumentsComponent implements OnInit {
  documents: Document[] = [];
  filteredDocuments: Document[] = [];
  isLoading = true;
  searchTerm = '';
  selectedCategory = '';
  selectedType = '';

  // Mock data
  private mockDocuments: Document[] = [
    {
      id: '1',
      name: 'Attestation de travail 2024',
      type: 'PDF',
      category: 'Attestations',
      size: 245760,
      downloadUrl: '/documents/attestation-travail-2024.pdf',
      uploadedAt: new Date(2024, 0, 15),
      description: 'Attestation de travail pour l\'année 2024'
    },
    {
      id: '2',
      name: 'Certificat médical',
      type: 'PDF',
      category: 'Justificatifs',
      size: 156432,
      downloadUrl: '/documents/certificat-medical.pdf',
      uploadedAt: new Date(2024, 0, 10),
      description: 'Certificat médical pour congé maladie'
    },
    {
      id: '3',
      name: 'Formulaire de demande de congé',
      type: 'DOC',
      category: 'Formulaires',
      size: 89123,
      downloadUrl: '/documents/formulaire-conge.doc',
      uploadedAt: new Date(2024, 0, 8),
      description: 'Formulaire vierge pour demande de congé'
    },
    {
      id: '4',
      name: 'Facture médicale',
      type: 'JPG',
      category: 'Justificatifs',
      size: 1234567,
      downloadUrl: '/documents/facture-medicale.jpg',
      uploadedAt: new Date(2024, 0, 5),
      description: 'Facture pour remboursement médical'
    }
  ];

  constructor() {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    // Simulate API call
    setTimeout(() => {
      this.documents = this.mockDocuments;
      this.applyFilters();
      this.isLoading = false;
    }, 1000);
  }

  applyFilters(): void {
    this.filteredDocuments = this.documents.filter(document => {
      const matchesSearch = !this.searchTerm || 
        document.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = !this.selectedCategory || document.category === this.selectedCategory;
      const matchesType = !this.selectedType || document.type === this.selectedType;
      
      return matchesSearch && matchesCategory && matchesType;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedType = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!this.searchTerm || !!this.selectedCategory || !!this.selectedType;
  }

  getFileIcon(type: string): string {
    const icons: Record<string, string> = {
      'PDF': 'picture_as_pdf',
      'DOC': 'description',
      'DOCX': 'description',
      'JPG': 'image',
      'JPEG': 'image',
      'PNG': 'image',
      'ZIP': 'archive',
      'RAR': 'archive'
    };
    return icons[type.toUpperCase()] || 'insert_drive_file';
  }

  getFileIconClass(type: string): string {
    const classes: Record<string, string> = {
      'PDF': 'file-pdf',
      'DOC': 'file-doc',
      'DOCX': 'file-doc',
      'JPG': 'file-image',
      'JPEG': 'file-image',
      'PNG': 'file-image',
      'ZIP': 'file-archive',
      'RAR': 'file-archive'
    };
    return classes[type.toUpperCase()] || 'file-default';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  downloadDocument(document: Document): void {
    console.log('Download document:', document.name);
    // Implement download logic
  }

  viewDocument(document: Document): void {
    console.log('View document:', document.name);
    // Implement view logic
  }

  shareDocument(document: Document): void {
    console.log('Share document:', document.name);
    // Implement share logic
  }

  uploadDocument(): void {
    console.log('Upload new document');
    // Implement upload logic
  }
}