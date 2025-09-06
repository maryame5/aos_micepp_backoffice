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
import { ReclamationService } from '../../../services/reclamation.service';
import { MatTableModule } from '@angular/material/table';
import { User, UserDTO } from '../../../models/user.model';

export interface Reclamation {
  id: number;
  objet: string;
  contenu: string;
  statut: string;
  dateSoumission: string;
  lastModifiedDate?: string;
  utilisateur: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedTo?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  commentaire?: string;
}

@Component({
  selector: 'app-admin-complaints',
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
    <div class="complaints-container">
      <app-page-header 
        title="Gestion des Réclamations" 
        subtitle="Traitez et gérez toutes les réclamations des utilisateurs">
      </app-page-header>

      <app-loading *ngIf="isLoading"></app-loading>

      <div class="complaints-content" *ngIf="!isLoading">
        <!-- Filters -->
        <mat-card class="filters-card">
          <div class="filters-container">
            <mat-form-field>
              <mat-label>Rechercher</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Objet ou contenu...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Statut</mat-label>
              <mat-select [(value)]="selectedStatus" (selectionChange)="applyFilters()">
                <mat-option value="">Tous les statuts</mat-option>
                <mat-option value="SOUMISE">Soumise</mat-option>
                <mat-option value="AFFECTEE">Affectée</mat-option>
                <mat-option value="EN_COURS">En cours</mat-option>
                <mat-option value="RESOLUE">Résolue</mat-option>
                <mat-option value="FERMEE">Fermée</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-icon-button (click)="clearFilters()" title="Effacer les filtres">
              <mat-icon>clear</mat-icon>
            </button>
          </div>
        </mat-card>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card new">
            <div class="stat-content">
              <div class="stat-number">{{ getComplaintsByStatus('SOUMISE').length }}</div>
              <div class="stat-label">Nouvelles</div>
            </div>
            <mat-icon>new_releases</mat-icon>
          </div>

          <div class="stat-card assigned">
            <div class="stat-content">
              <div class="stat-number">{{ getComplaintsByStatus('AFFECTEE').length }}</div>
              <div class="stat-label">Affectées</div>
            </div>
            <mat-icon>assignment_ind</mat-icon>
          </div>

          <div class="stat-card in-progress">
            <div class="stat-content">
              <div class="stat-number">{{ getComplaintsByStatus('EN_COURS').length }}</div>
              <div class="stat-label">En cours</div>
            </div>
            <mat-icon>sync</mat-icon>
          </div>

          <div class="stat-card resolved">
            <div class="stat-content">
              <div class="stat-number">{{ getComplaintsByStatus('RESOLUE').length + getComplaintsByStatus('FERMEE').length }}</div>
              <div class="stat-label">Terminées</div>
            </div>
            <mat-icon>check_circle</mat-icon>
          </div>
        </div>

        <!-- Complaints Table -->
        <div class="complaints-table" *ngIf="filteredComplaints.length > 0; else noComplaints">
          <table mat-table [dataSource]="filteredComplaints" class="mat-elevation-z8">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef> ID </th>
              <td mat-cell *matCellDef="let reclamation">
                <a [routerLink]="['/admin/complaints', reclamation.id]" class="id-link">{{ reclamation.id }}</a>
              </td>
            </ng-container>

            <ng-container matColumnDef="objet">
              <th mat-header-cell *matHeaderCellDef> Objet </th>
              <td mat-cell *matCellDef="let reclamation" class="objet-cell"> 
                {{ reclamation.objet }}
              </td>
            </ng-container>

            <ng-container matColumnDef="utilisateur">
              <th mat-header-cell *matHeaderCellDef> Utilisateur </th>
              <td mat-cell *matCellDef="let reclamation"> 
                {{ reclamation.utilisateur?.firstName }} {{ reclamation.utilisateur?.lastName }}
              </td>
            </ng-container>

            <ng-container matColumnDef="dateSoumission">
              <th mat-header-cell *matHeaderCellDef> Date de Soumission </th>
              <td mat-cell *matCellDef="let reclamation"> 
                {{ reclamation.dateSoumission | date:'dd/MM/yyyy HH:mm' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="statut">
              <th mat-header-cell *matHeaderCellDef> Statut </th>
              <td mat-cell *matCellDef="let reclamation">
                <mat-chip [class]="getStatusClass(reclamation.statut)">
                  {{ getStatusLabel(reclamation.statut) }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="assignedTo">
              <th mat-header-cell *matHeaderCellDef> Affecté à </th>
              <td mat-cell *matCellDef="let reclamation">
                <mat-form-field class="assign-select">
                  <mat-label>Affecter à</mat-label>
                  <mat-select 
                    [value]="reclamation.assignedTo?.id ? reclamation.assignedTo.id.toString() : null" 
                    (selectionChange)="assignComplaint(reclamation.id, $event.value)">
                    <mat-option [value]="null">Non affecté</mat-option>
                    <mat-option 
                      [value]="currentUserId?.toString()"
                      [class.assigned]="currentUserId?.toString() === reclamation.assignedTo?.id?.toString()">
                      Moi ({{ currentUser?.firstName }} {{ currentUser?.lastName }} - Admin)
                    </mat-option>
                    <mat-option 
                      *ngFor="let user of supportUsers" 
                      [value]="user.id.toString()" 
                      [class.assigned]="user.id.toString() === reclamation.assignedTo?.id?.toString()">
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

        <ng-template #noComplaints>
          <mat-card class="empty-state-card">
            <div class="empty-state">
              <mat-icon class="empty-icon">report_problem</mat-icon>
              <h3>Aucune réclamation trouvée</h3>
              <p *ngIf="hasActiveFilters()">Essayez de modifier vos critères de recherche</p>
              <p *ngIf="!hasActiveFilters()">Aucune réclamation disponible</p>
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

    .stat-card.new {
      border-left-color: #ef4444;
    }

    .stat-card.assigned {
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

    .complaints-table {
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

    .objet-cell {
      max-width: 300px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .id-link {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
    }

    .id-link:hover {
      text-decoration: underline;
    }

    .mat-chip.status-new,
    .mat-chip.status-soumise {
      background-color: #fee2e2 !important;
      color: #991b1b !important;
    }

    .mat-chip.status-assigned,
    .mat-chip.status-affectee {
      background-color: #fef3c7 !important;
      color: #92400e !important;
    }

    .mat-chip.status-in-progress,
    .mat-chip.status-en-cours {
      background-color: #dbeafe !important;
      color: #1e40af !important;
    }

    .mat-chip.status-resolved,
    .mat-chip.status-resolue,
    .mat-chip.status-fermee {
      background-color: #d1fae5 !important;
      color: #065f46 !important;
    }

    .mat-option.assigned {
      background-color: #e3f2fd !important;
      color: #1976d2 !important;
      font-weight: 500;
      position: relative;
    }

    .mat-option.assigned::after {
      content: '✓';
      position: absolute;
      right: 12px;
      color: #4caf50;
      font-weight: bold;
    }

    .mat-option.assigned:hover {
      background-color: #bbdefb !important;
    }

    .assign-select .mat-select-value {
      color: #1976d2;
      font-weight: 500;
    }

    .assigned-indicator {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #4caf50;
      margin-right: 8px;
    }

    .unassigned-indicator {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #f44336;
      margin-right: 8px;
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

      .assign-select {
        width: 150px;
      }

      .objet-cell {
        max-width: 200px;
      }
    }
  `]
})
export class AdminComplaintsComponent implements OnInit {
  complaints: Reclamation[] = [];
  filteredComplaints: Reclamation[] = [];
  isLoading = true;
  searchTerm = '';
  selectedStatus = '';
  displayedColumns: string[] = ['id', 'objet', 'utilisateur', 'dateSoumission', 'statut', 'assignedTo'];
  supportUsers: UserDTO[] = [];
  currentUserId: number | undefined;
  currentUser: User | null = null;

  constructor(
    private reclamationService: ReclamationService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    const currentUserData = this.authService.getCurrentUser();
    if (currentUserData?.id) {
      this.currentUserId = typeof currentUserData.id === 'number' 
        ? currentUserData.id 
        : Number(currentUserData.id);
    }

    console.log('ngOnInit - currentUser:', this.currentUser);
    console.log('ngOnInit - currentUserId:', this.currentUserId);

    this.loadComplaints();
    this.loadSupportUsers();
  }

  loadComplaints(): void {
    if (!this.authService.isAuthenticated()) {
      console.error('User not authenticated');
      this.snackBar.open('Veuillez vous connecter pour accéder aux réclamations', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/auth/login']);
      this.isLoading = false;
      return;
    }

    this.reclamationService.getComplaints().subscribe({
      next: (reclamations) => {
        console.log('Réclamations loaded:', reclamations);
        this.complaints = reclamations;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading complaints:', error);
        if (error.status === 401 || error.status === 403) {
          this.snackBar.open('Session expirée. Veuillez vous reconnecter.', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        } else {
          this.snackBar.open('Erreur lors du chargement des réclamations', 'Fermer', { duration: 5000 });
        }
        this.isLoading = false;
      }
    });
  }

  loadSupportUsers(): void {
    this.reclamationService.getSupportUsers().subscribe({
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
    this.filteredComplaints = this.complaints.filter(reclamation => {
      const matchesSearch = !this.searchTerm || 
        reclamation.objet.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        reclamation.contenu.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || reclamation.statut === this.selectedStatus;
      
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

  getComplaintsByStatus(status: string): Reclamation[] {
    return this.complaints.filter(reclamation => reclamation.statut === status);
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

  assignComplaint(complaintId: number, userIdStr: string | null): void {
    console.log('Component: assignComplaint called', { complaintId, userIdStr });

    if (typeof userIdStr === 'object' && userIdStr !== null) {
      console.error('Component: userIdStr is an object, should be string or null', userIdStr);
      this.snackBar.open('Erreur: format d\'ID utilisateur invalide', 'Fermer', { duration: 5000 });
      return;
    }

    if (userIdStr === null) {
      console.log('Component: Assigning to null');
      this.reclamationService.assignComplaint(complaintId, null as any).subscribe({
        next: (updatedComplaint) => {
          console.log('Component: Unassign complaint successful', updatedComplaint);
          const index = this.complaints.findIndex(r => r.id === complaintId);
          if (index !== -1) {
            this.complaints[index].assignedTo = null;
            this.applyFilters();
          }
          this.snackBar.open('Réclamation désaffectée avec succès', 'Fermer', { duration: 5000 });
        },
        error: (error) => {
          console.error('Component: Error unassigning complaint:', error);
          this.snackBar.open('Erreur lors de la désaffectation', 'Fermer', { duration: 5000 });
        }
      });
      return;
    }

    let userId: number;
    if (userIdStr === this.currentUserId?.toString()) {
      if (this.currentUserId == null || this.currentUserId == undefined) {
        console.log('Component: Invalid admin ID');
        this.snackBar.open('Impossible d\'assigner à l\'admin: ID invalide', 'Fermer', { duration: 5000 });
        return;
      }
      userId = this.currentUserId;
    } else {
      userId = Number(userIdStr);
      if (isNaN(userId)) {
        console.log('Component: Invalid user ID string');
        this.snackBar.open('ID utilisateur invalide', 'Fermer', { duration: 5000 });
        return;
      }
    }

    console.log('Component: Calling reclamationService.assignComplaint with userId:', userId);
    this.reclamationService.assignComplaint(complaintId, userId).subscribe({
      next: (updatedComplaint) => {
        console.log('Component: Assign complaint successful', updatedComplaint);
        const index = this.complaints.findIndex(r => r.id === complaintId);
        if (index !== -1) {
          this.complaints[index].assignedTo = updatedComplaint.assignedTo;
          this.applyFilters();
        }

        const assignedUser = userId === this.currentUserId 
          ? 'vous-même (Admin)' 
          : this.supportUsers.find(u => u.id === userId)?.firstname + ' ' + this.supportUsers.find(u => u.id === userId)?.lastname;
      
        this.snackBar.open(`Réclamation affectée à ${assignedUser} avec succès`, 'Fermer', { duration: 5000 });
      },
      error: (error) => {
        console.error('Component: Error assigning complaint:', error);
        this.snackBar.open('Erreur lors de l\'affectation', 'Fermer', { duration: 5000 });
      }
    });
  }
}