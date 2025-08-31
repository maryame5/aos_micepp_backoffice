import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../services/user.service';
import { UserDTO } from '../../../../models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ],
  template: `
    <div class="user-details-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Détails de l'utilisateur</mat-card-title>
          <mat-card-subtitle>Consultez et modifiez les informations de l'utilisateur</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="user && !loading; else loadingTemplate">
            <form (ngSubmit)="onSubmit()">
              <mat-form-field appearance="fill">
                <mat-label>Nom d'utilisateur</mat-label>
                <input matInput [(ngModel)]="user.username" name="username" required>
              </mat-form-field>
              <mat-form-field appearance="fill">
                <mat-label>Email</mat-label>
                <input matInput [(ngModel)]="user.email" name="email" type="email" required>
              </mat-form-field>
              <mat-form-field appearance="fill">
                <mat-label>Rôle</mat-label>
                <mat-select [(ngModel)]="user.role" name="role" required>
                  <mat-option value="ROLE_ADMIN">Administrateur</mat-option>
                  <mat-option value="ROLE_SUPPORT">Support</mat-option>
                  <mat-option value="ROLE_AGENT">Agent</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="fill">
                <mat-label>Téléphone</mat-label>
                <input matInput [(ngModel)]="user.phone" name="phone">
              </mat-form-field>
              <mat-form-field appearance="fill">
                <mat-label>CIN</mat-label>
                <input matInput [(ngModel)]="user.cin" name="cin">
              </mat-form-field>
              <mat-form-field appearance="fill">
                <mat-label>Matricule</mat-label>
                <input matInput [(ngModel)]="user.matricule" name="matricule">
              </mat-form-field>
              <div class="form-actions">
                <button mat-raised-button color="primary" type="submit">Enregistrer</button>
                <button mat-raised-button color="warn" type="button" (click)="onCancel()">Annuler</button>
              </div>
            </form>
          </div>
          <ng-template #loadingTemplate>
            <p>Chargement des données...</p>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .user-details-container {
      padding: 1rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .mat-form-field {
      width: 100%;
      margin-bottom: 1rem;
    }

    .form-actions {
      margin-top: 1rem;
      display: flex;
      gap: 1rem;
    }
  `]
})
export class UserDetailsComponent implements OnInit {
  user: UserDTO | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id')!;
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load user:', err);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.user) {
      this.userService.updateUser(this.user).subscribe({
        next: () => this.router.navigate(['/admin/users']),
        error: (err) => console.error('Update failed:', err)
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/users']);
  }
}
