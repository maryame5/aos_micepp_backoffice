import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';
import { LoadingComponent } from '../../../components/shared/loading/loading.component';
import { ReclamationService, Reclamation } from '../../../services/reclamation.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-my-complaints',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    PageHeaderComponent,
    LoadingComponent
  ],
  template: `
    <div class="my-complaints-container">
      <app-page-header
        title="Mes réclamations"
        subtitle="Liste des réclamations qui vous sont assignées">
      </app-page-header>

      <app-loading *ngIf="isLoading"></app-loading>

      <div class="complaints-content" *ngIf="!isLoading">
        <div class="complaints-table" *ngIf="myComplaints.length > 0; else noComplaints">
          <table mat-table [dataSource]="myComplaints" class="mat-elevation-z8">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef> ID de Réclamation </th>
              <td mat-cell *matCellDef="let reclamation">
                <a [routerLink]="['/admin/complaints', reclamation.id]" class="id-link">{{ reclamation.id }}</a>
              </td>
            </ng-container>

            <ng-container matColumnDef="objet">
              <th mat-header-cell *matHeaderCellDef> Objet </th>
              <td mat-cell *matCellDef="let reclamation"> {{ reclamation.objet }} </td>
            </ng-container>

            <ng-container matColumnDef="contenu">
              <th mat-header-cell *matHeaderCellDef> Contenu </th>
              <td mat-cell *matCellDef="let reclamation"> {{ reclamation.contenu | slice:0:80 }}... </td>
            </ng-container>

            <ng-container matColumnDef="dateSoumission">
              <th mat-header-cell *matHeaderCellDef> Date de Création </th>
              <td mat-cell *matCellDef="let reclamation"> {{ reclamation.dateSoumission | date:'dd/MM/yyyy' }} </td>
            </ng-container>

            <ng-container matColumnDef="statut">
              <th mat-header-cell *matHeaderCellDef> État de Réclamation </th>
              <td mat-cell *matCellDef="let reclamation">
                <mat-chip [class]="getStatusClass(reclamation.statut)">
                  {{ getStatusLabel(reclamation.statut) }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="utilisateurNom">
              <th mat-header-cell *matHeaderCellDef> Utilisateur </th>
              <td mat-cell *matCellDef="let reclamation"> {{ reclamation.utilisateur.firstName }} {{ reclamation.utilisateur.lastName }} </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <ng-template #noComplaints>
          <div class="empty-state">
            <mat-icon class="empty-icon">support_agent</mat-icon>
            <p>Aucune réclamation assignée</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .my-complaints-container {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .complaints-content {
      margin-top: 2rem;
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

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #64748b;
    }

    .empty-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    @media (max-width: 768px) {
      .mat-header-cell, .mat-cell {
        padding: 8px;
      }
    }
  `]
})
export class MyComplaintsComponent implements OnInit {
  myComplaints: Reclamation[] = [];
  isLoading = true;
  displayedColumns: string[] = ['id', 'objet', 'contenu', 'dateSoumission', 'statut', 'utilisateurNom'];

  constructor(
    private reclamationService: ReclamationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      const userId = parseInt(currentUser.id);
      this.reclamationService.getAssignedComplaints(userId).subscribe({
        next: (complaints) => {
          this.myComplaints = complaints;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading assigned complaints:', error);
          this.myComplaints = [];
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
      this.myComplaints = [];
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
    const classMap: Record<string, string> = {
      'EN_ATTENTE': 'status-pending',
      'EN_COURS': 'status-in-progress',
      'ACCEPTEE': 'status-completed',
      'REFUSEE': 'status-rejected'
    };
    return classMap[status] || 'status-pending';
  }
}
