import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';
import { UserService } from '../../../services/user.service';
import { UserDTO } from '../../../models/user.model';
import { FormsModule } from '@angular/forms'; 
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input'; 
import { MatSelectModule } from '@angular/material/select'; 

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    PageHeaderComponent,
    FormsModule,
    MatFormFieldModule, 
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="users-container">
      <app-page-header 
        title="Gestion des Utilisateurs" 
        subtitle="Gérez les comptes utilisateurs de la plateforme">
        <div slot="actions">
          <button mat-raised-button color="primary" routerLink="/admin/users/add">
            <mat-icon>person_add</mat-icon>
            Nouvel utilisateur
          </button>
        </div>
      </app-page-header>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Liste des utilisateurs</mat-card-title>
          <mat-card-subtitle>Consultez et gérez tous les comptes utilisateurs</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Filters -->
          <div class="filters-container">
            <mat-form-field >
              <mat-label>Rechercher</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="ID, Nom, Email, Rôle, Département...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>





            <button mat-icon-button (click)="clearFilters()" title="Effacer les filtres">
              <mat-icon>clear</mat-icon>
            </button>
          </div>

          <!-- Requests Table -->
          <div class="users-table" *ngIf="dataSource.data.length > 0; else noUsers">
            <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef> ID </th>
                <td mat-cell *matCellDef="let user"> {{ user.id }} </td>
              </ng-container>
              <ng-container matColumnDef="username">
                <th mat-header-cell *matHeaderCellDef> Nom </th>
                <td mat-cell *matCellDef="let user"> {{ user.firstname }} {{ user.lastname }} </td>
              </ng-container>
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef> Email </th>
                <td mat-cell *matCellDef="let user"> {{ user.email }} </td>
              </ng-container>
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef> Rôle </th>
                <td mat-cell *matCellDef="let user"> {{ user.role }} </td>
              </ng-container>
              <ng-container matColumnDef="department">
                <th mat-header-cell *matHeaderCellDef> Département </th>
                <td mat-cell *matCellDef="let user"> {{ user.department }} </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef> Actions </th>
                <td mat-cell *matCellDef="let user">
                  <button mat-icon-button [routerLink]="['/admin/users', user.id]" color="primary">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>

          <ng-template #noUsers>
            <div class="no-users">
              <mat-icon class="placeholder-icon">people</mat-icon>
              <h3>Aucun utilisateur trouvé</h3>
              <p>Cliquez sur "Nouvel utilisateur" pour créer un nouveau compte.</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .users-container {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .filters-container {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .filters-container mat-form-field {
      min-width: 200px;
     border:1px;
     border-color:black;
    }

    .users-table {
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

    .no-users {
      text-align: center;
      color: #64748b;
      padding: 2rem;
    }

    .placeholder-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .no-users h3 {
      margin: 1rem 0;
      color: #374151;
    }
    

    .no-users p {
      margin: 0.5rem 0;
      line-height: 1.6;
    }

    @media (max-width: 768px) {
      .users-container {
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
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  dataSource = new MatTableDataSource<UserDTO>([]);
  displayedColumns: string[] = ['id', 'username', 'email', 'role', 'department', 'actions'];
  searchTerm = '';
  selectedRole = '';
  selectedDepartment = '';
  uniqueDepartments: String[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users ?? [];
        this.updateUniqueDepartments();
        this.applyFilters();
        console.log("Received users:", users);
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.dataSource.data = [];
      }
    });
  }

  applyFilters(): void {
    this.dataSource.filterPredicate = (data: UserDTO, filter: string) => {
      const searchValue = this.searchTerm.toLowerCase();
      console.log("data",data);

      const matchesSearch = !this.searchTerm ||
        data.id.toString().includes(searchValue) ||
        `${data.firstname} ${data.lastname}`.toLowerCase().includes(searchValue) ||
        data.email.toLowerCase().includes(searchValue) ||
        data.role.toLowerCase().includes(searchValue) ||
        (data.department || '').toLowerCase().includes(searchValue);

      const matchesRole = !this.selectedRole || data.role.toLowerCase() === this.selectedRole.toLowerCase();
      const matchesDepartment = !this.selectedDepartment || (data.department ||"").toLowerCase() === this.selectedDepartment.toLowerCase();
    

      return matchesSearch && matchesRole && matchesDepartment;
    };
    this.dataSource.filter = 'apply'; // Trigger filter
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedDepartment = '';
    this.applyFilters();
  }

  updateUniqueDepartments(): void {
    const departments = this.dataSource.data.map(user => user.department).filter(dept => !!dept);
    this.uniqueDepartments = [...new Set(departments)];
  }
}