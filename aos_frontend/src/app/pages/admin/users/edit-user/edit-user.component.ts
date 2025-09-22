import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../../../components/shared/page-header/page-header.component';
import { LoadingComponent } from '../../../../components/shared/loading/loading.component';
import { UserService } from '../../../../services/user.service';
import { User, UserDTO } from '../../../../models/user.model';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    LoadingComponent
  ],
  template: `
    <div class="user-edit-container">
      <app-page-header 
        [title]="user ? 'Modifier ' + user.firstname + ' ' + user.lastname : 'Modifier l\\'utilisateur'" 
        subtitle="Modifiez les informations de l'utilisateur">
        <div slot="actions">
          <button mat-stroked-button [routerLink]="['/admin/users', userId]" [disabled]="saving">
            <mat-icon>arrow_back</mat-icon>
            Retour aux détails
          </button>
        </div>
      </app-page-header>

      <app-loading *ngIf="loading"></app-loading>

      <div class="form-content" *ngIf="!loading && userForm">
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
          <mat-card class="form-card">
            <mat-card-header>
              <mat-card-title>Informations personnelles</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field >
                  <mat-label>Prénom</mat-label>
                  <input matInput formControlName="firstname" placeholder="Prénom">
                  <mat-error *ngIf="userForm.get('firstname')?.hasError('required')">
                    Le prénom est requis
                  </mat-error>
                </mat-form-field>

                <mat-form-field >
                  <mat-label>Nom</mat-label>
                  <input matInput formControlName="lastname" placeholder="Nom de famille">
                  <mat-error *ngIf="userForm.get('lastname')?.hasError('required')">
                    Le nom est requis
                  </mat-error>
                </mat-form-field>

                <mat-form-field >
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email" placeholder="email@exemple.com">
                  <mat-error *ngIf="userForm.get('email')?.hasError('required')">
                    L'email est requis
                  </mat-error>
                  <mat-error *ngIf="userForm.get('email')?.hasError('email')">
                    Format d'email invalide
                  </mat-error>
                </mat-form-field>

                <mat-form-field >
                  <mat-label>Téléphone</mat-label>
                  <input matInput formControlName="phone" placeholder="+212 6XX XXX XXX">
                  <mat-error *ngIf="userForm.get('phone')?.hasError('pattern')">
                    Format de téléphone invalide
                  </mat-error>
                </mat-form-field>

                <mat-form-field >
                  <mat-label>CIN</mat-label>
                  <input matInput formControlName="cin" placeholder="CIN">
                  <mat-error *ngIf="userForm.get('cin')?.hasError('required')">
                    Le CIN est requis
                  </mat-error>
                  <mat-error *ngIf="userForm.get('cin')?.hasError('pattern')">
                    Format de CIN invalide
                  </mat-error>
                </mat-form-field>

                <mat-form-field >
                  <mat-label>Matricule</mat-label>
                  <input matInput formControlName="matricule" placeholder="Matricule">
                  <mat-error *ngIf="userForm.get('matricule')?.hasError('required')">
                    Le matricule est requis
                  </mat-error>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="form-card">
            <mat-card-header>
              <mat-card-title>Informations professionnelles</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field >
                  <mat-label>Département</mat-label>
                  <input matInput formControlName="department" placeholder="Département">
                </mat-form-field>

                <mat-form-field >
                  <mat-label>Rôle</mat-label>
                  <mat-select formControlName="role">
                    <mat-option value="AGENT">Agent</mat-option>
                    <mat-option value="SUPPORT">Support</mat-option>
                    <mat-option value="ADMIN">Administrateur</mat-option>
                  </mat-select>
                  <mat-error *ngIf="userForm.get('role')?.hasError('required')">
                    Le rôle est requis
                  </mat-error>
                </mat-form-field>
              </div>
              
              <div class="role-warning" *ngIf="showRoleWarning">
                <mat-icon>warning</mat-icon>
                <span>
                  Attention : La modification du rôle peut affecter les permissions de l'utilisateur 
                  et sa capacité à accéder à certaines fonctionnalités.
                </span>
              </div>
            </mat-card-content>
          </mat-card>

          <div class="form-actions">
            <button 
              mat-raised-button 
              color="primary" 
              type="submit" 
              [disabled]="userForm.invalid || saving">
              <mat-spinner diameter="20" *ngIf="saving"></mat-spinner>
              <mat-icon *ngIf="!saving">save</mat-icon>
              {{ saving ? 'Enregistrement...' : 'Enregistrer les modifications' }}
            </button>
            
            <button 
              mat-button 
              type="button" 
              [routerLink]="['/admin/users', userId]"
              [disabled]="saving">
              Annuler
            </button>
            
            <button 
              mat-button 
              type="button" 
              color="accent" 
              (click)="resetForm()"
              [disabled]="saving">
              <mat-icon>refresh</mat-icon>
              Réinitialiser
            </button>
          </div>
        </form>
      </div>

      <div class="empty-state" *ngIf="!loading && !user">
        <mat-icon class="empty-icon">person</mat-icon>
        <h3>Utilisateur non trouvé</h3>
        <p>L'utilisateur que vous souhaitez modifier n'existe pas ou a été supprimé.</p>
        <button mat-raised-button color="primary" routerLink="/admin/users">
          Retour aux utilisateurs
        </button>
      </div>
    </div>
  `,
  styles: [`
    .user-edit-container {
      padding: 1rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .form-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .role-warning {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-top: 1rem;
      padding: 1rem;
      background-color: #fef3c7;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
    }

    .role-warning mat-icon {
      color: #f59e0b;
      margin-top: 0.125rem;
    }

    .role-warning span {
      color: #92400e;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-start;
      align-items: center;
      padding: 1.5rem 0;
      border-top: 1px solid #e5e7eb;
      margin-top: 1rem;
    }

    .form-actions button {
      min-width: 150px;
    }

    .form-actions button[color="primary"] {
      display: flex;
      align-items: center;
      gap: 0.5rem;
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
      .user-edit-container {
        padding: 0.5rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .form-actions button {
        width: 100%;
        min-width: unset;
      }
    }
  `]
})
export class UserEditComponent implements OnInit {
  userForm!: FormGroup;
  user: UserDTO | null = null;
  userId!: string;
  loading = true;
  saving = false;
  showRoleWarning = false;
  originalRole = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    if (!this.userId) {
      this.snackBar.open('ID utilisateur invalide', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/admin/users']);
      return;
    }
    this.loadUser();
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required,Validators.minLength(10)]],
      cin: ['', [Validators.required]],
      matricule: ['', [Validators.required]],
      department: [''],
      role: ['', [Validators.required]]
    });

    // Surveiller les changements du rôle
    this.userForm.get('role')?.valueChanges.subscribe(newRole => {
      this.showRoleWarning = newRole !== this.originalRole;
    });
  }

  private loadUser(): void {
    this.loading = true;
    
    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.originalRole = this.normalizeRole(user.role);
        this.populateForm(user);
        this.loading = false;
        console.log(user);
      },
      error: (err) => {
        console.error('Failed to load user:', err);
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement de l\'utilisateur', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private populateForm(user: UserDTO): void {
    this.userForm.patchValue({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone || '',
      cin: user.cin || '',
      matricule: user.matricule || '',
      department: user.department || '',
      role: this.normalizeRole(user.role)
    });
  }

  private normalizeRole(role: string): string {
    // Normaliser le rôle en supprimant le préfixe ROLE_ s'il existe
    return role.replace('ROLE_', '');
  }

  onSubmit(): void {
    if (this.userForm.valid && this.user) {
      this.saving = true;
      
      const formData = this.userForm.value;
      const updateData: Partial<UserDTO> = {
        id: this.user.id,
        ...formData
      };

      this.userService.updateUser(this.userId, updateData).subscribe({
        next: (updatedUser) => {
          this.saving = false;
          this.snackBar.open('Utilisateur modifié avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          // Rediriger vers la page de détails
          this.router.navigate(['/admin/users', this.userId]);
        },
        error: (err) => {
          console.error('Failed to update user:', err);
          this.saving = false;
          
          let errorMessage = 'Erreur lors de la modification de l\'utilisateur';
          if (err.error?.message) {
            errorMessage = err.error.message;
          }
          
          this.snackBar.open(errorMessage, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  resetForm(): void {
    if (this.user) {
      this.populateForm(this.user);
      this.showRoleWarning = false;
      this.snackBar.open('Formulaire réinitialisé', 'Fermer', {
        duration: 2000
      });
    }
  }
}