import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';
import { UserService } from '../../../services/user.service';
import { User, UserDTO } from '../../../models/user.model';

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
    PageHeaderComponent
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
          <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef> ID </th>
              <td mat-cell *matCellDef="let user"> {{ user.id }} </td>
            </ng-container>
            <ng-container matColumnDef="username">
              <th mat-header-cell *matHeaderCellDef> Nom </th>
              <td mat-cell *matCellDef="let user"> {{ user.firstName }} {{ user.lastName }} </td>
            </ng-container>
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef> Email </th>
              <td mat-cell *matCellDef="let user"> {{ user.email }} </td>
            </ng-container>
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef> Rôle </th>
              <td mat-cell *matCellDef="let user"> {{ user.role }} </td>
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

          <div class="no-users" *ngIf="dataSource.data.length === 0">
            <mat-icon class="placeholder-icon">people</mat-icon>
            <h3>Aucun utilisateur trouvé</h3>
            <p>Cliquez sur "Nouvel utilisateur" pour créer un nouveau compte.</p>
          </div>
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

    .mat-table {
      width: 100%;
      margin-top: 1rem;
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
  `]
})
export class AdminUsersComponent implements OnInit {
  dataSource = new MatTableDataSource<User>([]);
  displayedColumns: string[] = ['id', 'username', 'email', 'role', 'actions'];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users ?? [];
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.dataSource.data = [];
      }
    });
  }
}