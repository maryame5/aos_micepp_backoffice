import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../../components/shared/page-header/page-header.component';
import { LoadingComponent } from '../../../../components/shared/loading/loading.component';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';
import { UserRole } from '../../../../models/user.model';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent,
    LoadingComponent
  ],
  template: `
    <div class="add-user-container">
      <app-page-header 
        title="Ajouter un utilisateur" 
        subtitle="Créez un nouveau compte utilisateur">
        <div slot="actions">
          <button mat-stroked-button routerLink="/admin/users">
            <mat-icon>arrow_back</mat-icon>
            Retour
          </button>
        </div>
      </app-page-header>

      <app-loading *ngIf="isLoading"></app-loading>

      <div class="form-content" *ngIf="!isLoading">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Informations de l'utilisateur</mat-card-title>
            <mat-card-subtitle>Remplissez les informations pour créer le compte</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="user-form">
              <div class="form-row">
                <mat-form-field >
                  <mat-label>Prénom</mat-label>
                  <input matInput formControlName="firstName" placeholder="Prénom de l'utilisateur">
                  <mat-error *ngIf="userForm.get('firstName')?.hasError('required')">
                    Le prénom est requis
                  </mat-error>
                </mat-form-field>

                  <mat-form-field appearance="outline">
                  <mat-label>Outline form field</mat-label>
                  <input matInput placeholder="Placeholder">
                  <mat-icon matSuffix>sentiment_very_satisfied</mat-icon>
                  <mat-hint>Hint</mat-hint>
                </mat-form-field>

                <mat-form-field appearance="fill" >
                  <mat-label>Nom de famille</mat-label>
                  <input matInput formControlName="lastName" placeholder="Nom de famille de l'utilisateur">
                  <mat-error *ngIf="userForm.get('lastName')?.hasError('required')">
                    Le nom de famille est requis
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" >
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email" placeholder="email@exemple.com">
                  <mat-error *ngIf="userForm.get('email')?.hasError('required')">
                    L'email est requis
                  </mat-error>
                  <mat-error *ngIf="userForm.get('email')?.hasError('email')">
                    Format d'email invalide
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="fill" class="form-field">
                   <mat-label>Téléphone</mat-label>
                   <input matInput type="tel" formControlName="phoneNumber" placeholder="+212 6 12 34 56 78">
                   <mat-error *ngIf="userForm.get('phoneNumber')?.hasError('required')">
                     Le numéro de téléphone est requis
                   </mat-error>
                 </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field  class="form-field">
                  <mat-label>CIN</mat-label>
                  <input matInput formControlName="cin" placeholder="Numéro de CIN">
                  <mat-error *ngIf="userForm.get('cin')?.hasError('required')">
                    Le CIN est requis
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Matricule</mat-label>
                  <input matInput formControlName="matricule" placeholder="Numéro de matricule">
                  <mat-error *ngIf="userForm.get('matricule')?.hasError('required')">
                    Le matricule est requis
                  </mat-error>
                </mat-form-field>


              </div>

              <div class="form-row">

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Département</mat-label>
                <input matInput formControlName="department" placeholder="Département de l'utilisateur">
                <mat-error *ngIf="userForm.get('department')?.hasError('required')">
                  Le département est requis
                </mat-error>
              </mat-form-field>
                <mat-form-field appearance="outline" class="form-field">
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

              <div class="form-actions">
                <button mat-stroked-button type="button" routerLink="/admin/users">
                  Annuler
                </button>
                <button 
                  mat-raised-button 
                  color="primary" 
                  type="submit">
                  <mat-icon *ngIf="isSubmitting">hourglass_empty</mat-icon>
                 Créer l'utilisateur
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .add-user-container {
      padding: 1rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .form-content {
      margin-top: 2rem;
    }

    .user-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem; /* Reduced gap to minimize dividing line */
    }

    .form-field {
      width: 100%;
      box-sizing: border-box; 
    }

    

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e5e7eb;
    }

    @media (max-width: 768px) {
      .add-user-container {
        padding: 0.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column-reverse;
      }
    }
  `]
})
export class AddUserComponent implements OnInit {
  userForm: FormGroup;
  isLoading = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      cin: ['', [Validators.required]],
      matricule: ['', [Validators.required]],
      role: ['ROLE_AGENT', [Validators.required]],
      department: ['', [Validators.required]]

    });
  }

  ngOnInit(): void {
    // Check if user has admin role
    const currentUser = this.authService.getCurrentUser();
    console.log('Current user:', currentUser);
    console.log('User role:', currentUser?.role);
    
    if (!this.authService.hasRole(UserRole.ADMIN)) {
      console.error('User does not have admin role');
      this.snackBar.open('Accès interdit. Vous devez être administrateur.', 'Fermer', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/admin/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isSubmitting = true;
      
      const userData = this.userForm.value;
      console.log('Submitting user data:', userData);
      console.log('Current user token:', this.authService.getToken());
      console.log('Current user role:', this.authService.getCurrentUser()?.role);
      
      this.userService.registerUser(userData).subscribe({
        next: (response) => {
          console.log('User created successfully:', response);
          this.snackBar.open('Utilisateur créé avec succès ! Un email avec le mot de passe temporaire a été envoyé.', 'Fermer', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          console.error('Error creating user:', error);
          let errorMessage = 'Erreur lors de la création de l\'utilisateur';
          
          if (error.message) {
            errorMessage = error.message;
          } else if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.status === 400) {
            errorMessage = 'Données invalides. Vérifiez les informations saisies.';
          } else if (error.status === 409) {
            errorMessage = 'Un utilisateur avec cet email, CIN ou matricule existe déjà.';
          }
          
          this.snackBar.open(errorMessage, 'Fermer', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    }
  }
}
