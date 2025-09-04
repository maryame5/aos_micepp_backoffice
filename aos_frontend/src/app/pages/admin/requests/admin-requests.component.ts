import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterModule } from '@angular/router';
import { LoadingComponent } from '../../../components/shared/loading/loading.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { RequestService } from '../../../services/request.service';
import { MatTableModule } from '@angular/material/table';
import { User, UserDTO } from '../../../models/user.model';

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
  utilisateurId: number;
  utilisateurNom: string;
  utilisateurEmail: string;
  documentsJustificatifs: DocumentJustificatif[];
  serviceNom: string;
  serviceId: number;
  assignedTo?: { id: number; username: string } | null;
}

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    PageHeaderComponent,
    LoadingComponent,
    MatSelectModule,
    MatTableModule
  ],
  template: `
    <div class="requests-container">
      <app-page-header 
        title="Gestion des Demandes" 
        subtitle="Traitez et gérez toutes les demandes des agents">
      </app-page-header>

      <app-loading *ngIf="isLoading"></app-loading>

      <div class="requests-content" *ngIf="!isLoading">
        <!-- Filters -->
        <mat-card class="filters-card">
          <div class="filters-container">
            <mat-form-field >
              <mat-label>Rechercher</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Titre ou description...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field >
              <mat-label>Statut</mat-label>
              <mat-select [(value)]="selectedStatus" (selectionChange)="applyFilters()">
                <mat-option value="">Tous les statuts</mat-option>
                <mat-option value="EN_ATTENTE">En attente</mat-option>
                <mat-option value="EN_COURS">En cours</mat-option>
                <mat-option value="ACCEPTEE">Acceptée</mat-option>
                <mat-option value="REFUSEE">Refusée</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-icon-button (click)="clearFilters()" title="Effacer les filtres">
              <mat-icon>clear</mat-icon>
            </button>
          </div>
        </mat-card>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card pending">
            <div class="stat-content">
              <div class="stat-number">{{ getRequestsByStatus('EN_ATTENTE').length }}</div>
              <div class="stat-label">En attente</div>
            </div>
            <mat-icon>hourglass_empty</mat-icon>
          </div>

          <div class="stat-card in-progress">
            <div class="stat-content">
              <div class="stat-number">{{ getRequestsByStatus('EN_COURS').length }}</div>
              <div class="stat-label">En cours</div>
            </div>
            <mat-icon>sync</mat-icon>
          </div>

          <div class="stat-card completed">
            <div class="stat-content">
              <div class="stat-number">{{ getRequestsByStatus('ACCEPTEE').length + getRequestsByStatus('REFUSEE').length }}</div>
              <div class="stat-label">Terminées</div>
            </div>
            <mat-icon>check_circle</mat-icon>
          </div>
        </div>

        <!-- Requests Table -->
        <div class="requests-table" *ngIf="filteredRequests.length > 0; else noRequests">
          <table mat-table [dataSource]="filteredRequests" class="mat-elevation-z8">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef> ID de Demande </th>
              <td mat-cell *matCellDef="let demande">
                <a [routerLink]="['/admin/requests', demande.id]" class="id-link">{{ demande.id }}</a>
              </td>
            </ng-container>

            <ng-container matColumnDef="utilisateurNom">
              <th mat-header-cell *matHeaderCellDef> Nom de l'Utilisateur </th>
              <td mat-cell *matCellDef="let demande"> {{ demande.utilisateurNom }} </td>
            </ng-container>

            <ng-container matColumnDef="serviceNom">
              <th mat-header-cell *matHeaderCellDef> Nom de Service </th>
              <td mat-cell *matCellDef="let demande"> {{ demande.serviceNom || 'Service non défini' }} </td>
            </ng-container>

            <ng-container matColumnDef="dateSoumission">
              <th mat-header-cell *matHeaderCellDef> Date de Création </th>
              <td mat-cell *matCellDef="let demande"> {{ demande.dateSoumission | date:'dd/MM/yyyy' }} </td>
            </ng-container>

            <ng-container matColumnDef="statut">
              <th mat-header-cell *matHeaderCellDef> État de Demande </th>
              <td mat-cell *matCellDef="let demande">
                <mat-chip [class]="getStatusClass(demande.statut)">
                  {{ getStatusLabel(demande.statut) }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="assignedTo">
              <th mat-header-cell *matHeaderCellDef> Affecter à </th>
              <td mat-cell *matCellDef="let demande">
                <mat-form-field  class="assign-select">
                  <mat-label>Affecter à</mat-label>
                  <mat-select [value]="demande.assignedTo.username" (selectionChange)="assignRequest(demande.id, $event.value)">
                    <mat-option [value]="null">Non affecté</mat-option>
                    <mat-option [value]="currentUser">
                      Moi (Admin) 
                    </mat-option>
                    <mat-option *ngFor="let user of supportUsers" [value]="user">
                      {{ user.firstname }} {{ user.lastname }} (Support)
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <ng-template #noRequests>
          <mat-card class="empty-state-card">
            <div class="empty-state">
              <mat-icon class="empty-icon">assignment</mat-icon>
              <h3>Aucune demande trouvée</h3>
              <p *ngIf="hasActiveFilters()">Essayez de modifier vos critères de recherche</p>
              <p *ngIf="!hasActiveFilters()">Aucune demande disponible</p>
            </div>
          </mat-card>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .requests-container {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .requests-content {
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

    .stat-card.pending {
      border-left-color: #f59e0b;
    }

    .stat-card.in-progress {
      border-left-color: #3b82f6;
    }

    .stat-card.completed {
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

    .requests-table {
      overflow: auto;
    }

    table {
      width: 100%;
    }

    th.mat-header-cell, td.mat-cell {
      padding: 16px;
      text-align: left;
    }

    tr.mat-row:hover {
      background-color: #f5f5f5;
    }

    .assign-select {
      width: 200px;
    }

    .id-link {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
    }

    .id-link:hover {
      text-decoration: underline;
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
      .requests-container {
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

      .assign-select {
        width: 150px;
      }
    }
  `]
})
export class AdminRequestsComponent implements OnInit {
  requests: Demande[] = [];
  filteredRequests: Demande[] = [];
  isLoading = true;
  searchTerm = '';
  selectedStatus = '';
  displayedColumns: string[] = ['id', 'utilisateurNom', 'serviceNom', 'dateSoumission', 'statut', 'assignedTo'];
  supportUsers: UserDTO[] = [];
  currentUserId: number | undefined;
  currentUser: User | null = null;

  constructor(
    private requestService: RequestService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser =this.authService.getCurrentUser()
    this.currentUserId = this.authService.getCurrentUser()?.id
      ? Number(this.authService.getCurrentUser()?.id)
      : undefined;
    this.loadRequests();
    this.loadSupportUsers();
  }

  loadRequests(): void {
    if (!this.authService.isAuthenticated()) {
      console.error('User not authenticated');
      this.snackBar.open('Veuillez vous connecter pour accéder à vos demandes', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/auth/login']);
      this.isLoading = false;
      return;
    }

    this.requestService.getRequests().subscribe({
      next: (demandes) => {
        console.log('Demandes loaded:', demandes);
        this.requests = demandes.map(d => ({
          ...d,
          assignedTo: d.assignedTo ? { id: d.assignedTo.id, username: d.assignedTo.username } : null
        }));
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        if (error.status === 401 || error.status === 403) {
          this.snackBar.open('Session expirée. Veuillez vous reconnecter.', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        } else {
          this.snackBar.open('Erreur lors du chargement des demandes', 'Fermer', { duration: 5000 });
        }
        this.isLoading = false;
      }
    });
  }

  loadSupportUsers(): void {
    this.requestService.getSupportUsers().subscribe({
      next: (users) => {
        this.supportUsers = users.map(user => ({
          ...user,
          firstname: user.firstname || '',
          lastname: user.lastname || ''
        }));
        console.log('Support users loaded:', this.supportUsers);
        
      },
      error: (error) => {
        console.error('Error loading support users:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredRequests = this.requests.filter(demande => {
      const matchesSearch = !this.searchTerm || 
        demande.commentaire.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        demande.serviceId.toString().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || demande.statut === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!this.searchTerm || !!this.selectedStatus;
  }

  getRequestsByStatus(status: string): Demande[] {
    return this.requests.filter(demande => demande.statut === status);
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
    const classMap: Record<string, string> = {
      'EN_ATTENTE': 'status-pending',
      'EN_COURS': 'status-in-progress',
      'ACCEPTEE': 'status-completed',
      'REFUSEE': 'status-rejected'
    };
    return classMap[status] || 'status-pending';
  }

  canEditRequest(demande: Demande): boolean {
    return demande.statut === 'EN_ATTENTE';
  }

  assignRequest(requestId: number, user: { id: number; username: string } | null): void {
    console.log('Component: assignRequest called', { requestId, user });
    if (!user || user.id === undefined) {
      console.log('Component: Invalid user selected');
      this.snackBar.open('Veuillez sélectionner un utilisateur valide', 'Fermer', { duration: 5000 });
      return;
    }

    console.log('Component: Calling requestService.assignRequest');
    this.requestService.assignRequest(requestId, user.id).subscribe({
      next: (updatedRequest) => {
        console.log('Component: Assign request successful', updatedRequest);
        const index = this.requests.findIndex(r => r.id === requestId);
        if (index !== -1) {
          this.requests[index].assignedTo = updatedRequest.assignedTo
            ? { id: updatedRequest.assignedTo.id, username: updatedRequest.assignedTo.username }
            : null;
          this.applyFilters();
        }
        this.snackBar.open('Demande affectée avec succès', 'Fermer', { duration: 5000 });
      },
      error: (error) => {
        console.error('Component: Error assigning request:', error);
        this.snackBar.open('Erreur lors de l\'affectation', 'Fermer', { duration: 5000 });
      }
    });
  }
}