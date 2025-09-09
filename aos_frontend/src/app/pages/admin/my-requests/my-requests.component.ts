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
import { RequestService, Demande } from '../../../services/request.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-my-requests',
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
    <div class="my-requests-container">
      <app-page-header
        title="Mes demandes"
        subtitle="Liste des demandes qui vous sont assignées">
      </app-page-header>

      <app-loading *ngIf="isLoading"></app-loading>

      <div class="requests-content" *ngIf="!isLoading">
        <div class="requests-table" *ngIf="myRequests.length > 0; else noRequests">
          <table mat-table [dataSource]="myRequests" class="mat-elevation-z8">
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

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <ng-template #noRequests>
          <div class="empty-state">
            <mat-icon class="empty-icon">assignment</mat-icon>
            <p>Aucune demande assignée</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .my-requests-container {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .requests-content {
      margin-top: 2rem;
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
export class MyRequestsComponent implements OnInit {
  myRequests: Demande[] = [];
  isLoading = true;
  displayedColumns: string[] = ['id', 'utilisateurNom', 'serviceNom', 'dateSoumission', 'statut'];

  constructor(
    private requestService: RequestService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      const userId=parseInt(currentUser.id)
      this.requestService.getAssignedRequests(userId).subscribe({
        next: (requests) => {
          this.myRequests = requests;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading assigned requests:', error);
          this.myRequests = [];
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
      this.myRequests = [];
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
