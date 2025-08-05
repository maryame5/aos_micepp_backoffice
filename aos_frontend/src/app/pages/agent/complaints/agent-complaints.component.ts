import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';
import { LoadingComponent } from '../../../components/shared/loading/loading.component';
import { AuthService } from '../../../services/auth.service';

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  resolution?: string;
}

@Component({
  selector: 'app-agent-complaints',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    PageHeaderComponent,
    LoadingComponent
  ],
  
  template: `
    <div class="complaints-container">
      <app-page-header 
        title="Mes Réclamations" 
        subtitle="Consultez et gérez vos réclamations">
        <div slot="actions">
          <button mat-raised-button color="primary" (click)="openNewComplaintDialog()">
            <mat-icon>add</mat-icon>
            Nouvelle réclamation
          </button>
        </div>
      </app-page-header>

      <app-loading *ngIf="isLoading"></app-loading>

      <div class="complaints-content" *ngIf="!isLoading">
        <!-- Filters -->
        <mat-card class="filters-card">
          <div class="filters-container">
            <mat-form-field appearance="outline">
              <mat-label>Rechercher</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Titre ou description...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Statut</mat-label>
              <mat-select [(value)]="selectedStatus" (selectionChange)="applyFilters()">
                <mat-option value="">Tous les statuts</mat-option>
                <mat-option value="OPEN">Ouverte</mat-option>
                <mat-option value="ASSIGNED">Assignée</mat-option>
                <mat-option value="IN_PROGRESS">En cours</mat-option>
                <mat-option value="RESOLVED">Résolue</mat-option>
                <mat-option value="CLOSED">Fermée</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Catégorie</mat-label>
              <mat-select [(value)]="selectedCategory" (selectionChange)="applyFilters()">
                <mat-option value="">Toutes les catégories</mat-option>
                <mat-option value="Technique">Technique</mat-option>
                <mat-option value="Service">Service</mat-option>
                <mat-option value="Facturation">Facturation</mat-option>
                <mat-option value="Autre">Autre</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-icon-button (click)="clearFilters()" title="Effacer les filtres">
              <mat-icon>clear</mat-icon>
            </button>
          </div>
        </mat-card>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card open">
            <div class="stat-content">
              <div class="stat-number">{{ getComplaintsByStatus('OPEN').length }}</div>
              <div class="stat-label">Ouvertes</div>
            </div>
            <mat-icon>report_problem</mat-icon>
          </div>

          <div class="stat-card in-progress">
            <div class="stat-content">
              <div class="stat-number">{{ getComplaintsByStatus('IN_PROGRESS').length + getComplaintsByStatus('ASSIGNED').length }}</div>
              <div class="stat-label">En traitement</div>
            </div>
            <mat-icon>sync</mat-icon>
          </div>

          <div class="stat-card resolved">
            <div class="stat-content">
              <div class="stat-number">{{ getComplaintsByStatus('RESOLVED').length + getComplaintsByStatus('CLOSED').length }}</div>
              <div class="stat-label">Résolues</div>
            </div>
            <mat-icon>check_circle</mat-icon>
          </div>
        </div>

        <!-- Complaints List -->
        <div class="complaints-list" *ngIf="filteredComplaints.length > 0; else noComplaints">
          <mat-card class="complaint-card" *ngFor="let complaint of filteredComplaints">
            <mat-card-header>
              <div class="complaint-header-content">
                <div class="complaint-title-section">
                  <mat-card-title>{{ complaint.title }}</mat-card-title>
                  <mat-card-subtitle>{{ complaint.description | slice:0:150 }}...</mat-card-subtitle>
                </div>
                <div class="complaint-status">
                  <mat-chip [class]="getStatusClass(complaint.status)">
                    {{ getStatusLabel(complaint.status) }}
                  </mat-chip>
                </div>
              </div>
            </mat-card-header>

            <mat-card-content>
              <div class="complaint-meta">
                <div class="meta-item">
                  <mat-icon>category</mat-icon>
                  <span>{{ complaint.category }}</span>
                </div>
                <div class="meta-item">
                  <mat-icon>event</mat-icon>
                  <span>Créée le {{ complaint.createdAt | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="meta-item" *ngIf="complaint.updatedAt !== complaint.createdAt">
                  <mat-icon>update</mat-icon>
                  <span>Modifiée le {{ complaint.updatedAt | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="meta-item" *ngIf="complaint.priority">
                  <mat-icon [class]="getPriorityIconClass(complaint.priority)">
                    {{ getPriorityIcon(complaint.priority) }}
                  </mat-icon>
                  <span>{{ getPriorityLabel(complaint.priority) }}</span>
                </div>
                <div class="meta-item" *ngIf="complaint.assignedTo">
                  <mat-icon>person</mat-icon>
                  <span>Assignée à {{ complaint.assignedTo }}</span>
                </div>
              </div>

              <div class="resolution-section" *ngIf="complaint.resolution">
                <h4>Résolution</h4>
                <p>{{ complaint.resolution }}</p>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button (click)="viewComplaint(complaint.id)">
                <mat-icon>visibility</mat-icon>
                Voir détails
              </button>
              <button mat-button *ngIf="canEditComplaint(complaint)" color="primary">
                <mat-icon>edit</mat-icon>
                Modifier
              </button>
              <button mat-button *ngIf="complaint.status === 'RESOLVED'" color="accent">
                <mat-icon>thumb_up</mat-icon>
                Marquer comme satisfait
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <ng-template #noComplaints>
          <mat-card class="empty-state-card">
            <div class="empty-state">
              <mat-icon class="empty-icon">report_problem</mat-icon>
              <h3>Aucune réclamation trouvée</h3>
              <p *ngIf="hasActiveFilters()">Essayez de modifier vos critères de recherche</p>
              <p *ngIf="!hasActiveFilters()">Vous n'avez pas encore créé de réclamation</p>
              <button mat-raised-button color="primary" (click)="openNewComplaintDialog()">
                <mat-icon>add</mat-icon>
                Créer ma première réclamation
              </button>
            </div>
          </mat-card>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .complaints-container {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .complaints-content {
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-left: 4px solid;
    }

    .stat-card.open {
      border-left-color: #f59e0b;
    }

    .stat-card.in-progress {
      border-left-color: #3b82f6;
    }

    .stat-card.resolved {
      border-left-color: #10b981;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
    }

    .stat-label {
      color: #64748b;
      font-size: 0.875rem;
    }

    .stat-card mat-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      opacity: 0.7;
    }

    .complaints-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .complaint-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .complaint-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .complaint-header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .complaint-title-section {
      flex: 1;
    }

    .complaint-status {
      flex-shrink: 0;
      margin-left: 1rem;
    }

    .complaint-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 1rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #64748b;
      font-size: 0.875rem;
    }

    .meta-item mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .resolution-section {
      margin-top: 1rem;
      padding: 1rem;
      background: #f0fdf4;
      border-radius: 8px;
      border-left: 4px solid #10b981;
    }

    .resolution-section h4 {
      margin: 0 0 0.5rem 0;
      color: #065f46;
      font-size: 0.875rem;
    }

    .resolution-section p {
      margin: 0;
      color: #047857;
      font-size: 0.875rem;
    }

    .priority-high,
    .priority-urgent {
      color: #dc2626 !important;
    }

    .priority-medium {
      color: #f59e0b !important;
    }

    .priority-low {
      color: #059669 !important;
    }

    .mat-chip.status-open {
      background-color: #fef3c7 !important;
      color: #92400e !important;
    }

    .mat-chip.status-assigned,
    .mat-chip.status-in-progress {
      background-color: #dbeafe !important;
      color: #1e40af !important;
    }

    .mat-chip.status-resolved,
    .mat-chip.status-closed {
      background-color: #d1fae5 !important;
      color: #065f46 !important;
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
      .complaints-container {
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

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .complaint-header-content {
        flex-direction: column;
        gap: 1rem;
      }

      .complaint-status {
        margin-left: 0;
        align-self: flex-start;
      }

      .complaint-meta {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class AgentComplaintsComponent implements OnInit {
  complaints: Complaint[] = [];
  filteredComplaints: Complaint[] = [];
  isLoading = true;
  searchTerm = '';
  selectedStatus = '';
  selectedCategory = '';

  // Mock data
  private mockComplaints: Complaint[] = [
    {
      id: '1',
      title: 'Problème de connexion à la plateforme',
      description: 'Je n\'arrive pas à me connecter depuis ce matin, le site affiche une erreur 500.',
      category: 'Technique',
      status: 'OPEN',
      priority: 'HIGH',
      createdAt: new Date(2024, 0, 15),
      updatedAt: new Date(2024, 0, 15)
    },
    {
      id: '2',
      title: 'Délai de traitement trop long',
      description: 'Ma demande de congé est en attente depuis plus de 2 semaines sans réponse.',
      category: 'Service',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      createdAt: new Date(2024, 0, 10),
      updatedAt: new Date(2024, 0, 12),
      assignedTo: 'Support Technique'
    },
    {
      id: '3',
      title: 'Erreur dans le calcul des remboursements',
      description: 'Le montant calculé pour mon remboursement médical ne correspond pas aux factures jointes.',
      category: 'Facturation',
      status: 'RESOLVED',
      priority: 'HIGH',
      createdAt: new Date(2024, 0, 5),
      updatedAt: new Date(2024, 0, 8),
      assignedTo: 'Service Comptabilité',
      resolution: 'Erreur corrigée, nouveau calcul effectué. Le remboursement sera traité dans les 48h.'
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadComplaints();
  }

  loadComplaints(): void {
    // Simulate API call
    setTimeout(() => {
      this.complaints = this.mockComplaints;
      this.applyFilters();
      this.isLoading = false;
    }, 1000);
  }

  applyFilters(): void {
    this.filteredComplaints = this.complaints.filter(complaint => {
      const matchesSearch = !this.searchTerm || 
        complaint.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || complaint.status === this.selectedStatus;
      const matchesCategory = !this.selectedCategory || complaint.category === this.selectedCategory;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedCategory = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!this.searchTerm || !!this.selectedStatus || !!this.selectedCategory;
  }

  getComplaintsByStatus(status: string): Complaint[] {
    return this.complaints.filter(complaint => complaint.status === status);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'OPEN': 'Ouverte',
      'ASSIGNED': 'Assignée',
      'IN_PROGRESS': 'En cours',
      'RESOLVED': 'Résolue',
      'CLOSED': 'Fermée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
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

  getPriorityIcon(priority: string): string {
    const icons: Record<string, string> = {
      'LOW': 'keyboard_arrow_down',
      'MEDIUM': 'remove',
      'HIGH': 'keyboard_arrow_up',
      'URGENT': 'priority_high'
    };
    return icons[priority] || 'remove';
  }

  getPriorityIconClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }

  canEditComplaint(complaint: Complaint): boolean {
    return complaint.status === 'OPEN';
  }

  viewComplaint(id: string): void {
    // Navigate to complaint detail
    console.log('View complaint:', id);
  }

  openNewComplaintDialog(): void {
    // Open dialog or navigate to new complaint form
    console.log('Open new complaint dialog');
  }
}