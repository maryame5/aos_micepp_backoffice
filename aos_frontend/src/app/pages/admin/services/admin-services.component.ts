import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { AdminServiceService, ServiceDTO } from '../../../services/admin-service.service';
import { ServiceFormDialogComponent } from './service-form-dialog.component';
import { PageHeaderComponent } from "../../../components/shared/page-header/page-header.component";

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTableModule,
    MatSlideToggleModule,
    MatChipsModule,
    PageHeaderComponent
],
  template: `
    <div class="admin-services-page">
 

        <app-page-header 
        title="Gestion des Services" 
        subtitle="Gérez le contenu des services de la plateforme">
        <div slot="actions">
          <button mat-raised-button color="primary" (click)="openCreateDialog()">
            <mat-icon>add</mat-icon>
            Nouveau Service
          </button>
        </div>
      </app-page-header>




      <div class="services-content">
        <div class="loading-container" *ngIf="loading">
          <mat-spinner></mat-spinner>
          <p>Chargement des services...</p>
        </div>

        <div class="error-container" *ngIf="error">
          <div class="error-message">
            <mat-icon>error</mat-icon>
            <p>{{ error }}</p>
            <button mat-raised-button color="primary" (click)="loadServices()">Réessayer</button>
          </div>
        </div>

        <div class="services-list" *ngIf="!loading && !error && services.length > 0">
          <mat-card class="service-item" *ngFor="let service of services">
            <mat-card-header>
              <div mat-card-avatar class="service-avatar">
                <mat-icon>{{ service.icon }}</mat-icon>
              </div>
              <mat-card-title>{{ service.title }}</mat-card-title>
              <mat-card-subtitle>{{ service.type }}</mat-card-subtitle>
              <div class="header-actions">
                <mat-slide-toggle 
                  [checked]="service.isActive" 
                  (change)="toggleServiceStatus(service)"
                  color="primary">
                </mat-slide-toggle>
              </div>
            </mat-card-header>
            
            <mat-card-content>
              <p class="service-description">{{ service.description }}</p>
              <div class="service-features">
                <mat-chip-listbox>
                  <mat-chip *ngFor="let feature of service.features">{{ feature }}</mat-chip>
                </mat-chip-listbox>
              </div>
            </mat-card-content>
            
            <mat-card-actions>
              <button mat-button (click)="openEditDialog(service)">
                <mat-icon>edit</mat-icon>
                Modifier
              </button>
              <button mat-button color="warn" (click)="deleteService(service)">
                <mat-icon>delete</mat-icon>
                Supprimer
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <div class="no-services" *ngIf="!loading && !error && services.length === 0">
          <mat-icon>business</mat-icon>
          <h3>Aucun service trouvé</h3>
          <p>Créez votre premier service en cliquant sur le bouton "Nouveau Service"</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-services-page {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .page-header h1 {
      margin: 0;
      color: #333;
      font-weight: 500;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    .loading-container p {
      margin-top: 1rem;
      color: #666;
    }

    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .error-message {
      text-align: center;
      background: #fff;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .error-message mat-icon {
      font-size: 3rem;
      color: #f44336;
      margin-bottom: 1rem;
    }

    .error-message p {
      color: #f44336;
      margin-bottom: 1rem;
    }

    .services-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .service-item {
      transition: all 0.3s ease;
    }

    .service-item:hover {
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .service-avatar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-actions {
      margin-left: auto;
    }

    .service-description {
      color: #666;
      margin-bottom: 1rem;
    }

    .service-features {
      margin-top: 1rem;
    }

    mat-chip {
      margin: 0.25rem;
    }

    .no-services {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .no-services mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
      margin-bottom: 1rem;
    }

    .no-services h3 {
      margin: 1rem 0;
      color: #333;
    }
  `]
})
export class AdminServicesComponent implements OnInit {
  services: ServiceDTO[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private adminServiceService: AdminServiceService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading = true;
    this.error = null;
    
    this.adminServiceService.getAllServicesForAdmin().subscribe({
      next: (services) => {
        this.services = services;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des services';
        this.loading = false;
        console.error('Error loading services:', error);
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ServiceFormDialogComponent, {
      width: '800px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadServices();
        this.snackBar.open('Service créé avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  openEditDialog(service: ServiceDTO): void {
    const dialogRef = this.dialog.open(ServiceFormDialogComponent, {
      width: '800px',
      data: { mode: 'edit', service: service }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadServices();
        this.snackBar.open('Service modifié avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  toggleServiceStatus(service: ServiceDTO): void {
    if (service.id) {
      this.adminServiceService.toggleServiceStatus(service.id).subscribe({
        next: (updatedService) => {
          const index = this.services.findIndex(s => s.id === service.id);
          if (index >= 0) {
            this.services[index] = updatedService;
          }
          const status = updatedService.isActive ? 'activé' : 'désactivé';
          this.snackBar.open(`Service ${status} avec succès`, 'Fermer', {
            duration: 3000
          });
        },
        error: (error) => {
          console.error('Error toggling service status:', error);
          this.snackBar.open('Erreur lors de la modification du statut', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  deleteService(service: ServiceDTO): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le service "${service.title}" ?`)) {
      if (service.id) {
        this.adminServiceService.deleteService(service.id).subscribe({
          next: () => {
            this.services = this.services.filter(s => s.id !== service.id);
            this.snackBar.open('Service supprimé avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            console.error('Error deleting service:', error);
            this.snackBar.open('Erreur lors de la suppression du service', 'Fermer', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    }
  }
}