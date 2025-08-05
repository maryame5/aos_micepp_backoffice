import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';
import { RequestService } from '../../../services/request.service';
import { AuthService } from '../../../services/auth.service';
import { Service, RequestPriority } from '../../../models/request.model';

@Component({
  selector: 'app-new-request',
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
    MatStepperModule,
    PageHeaderComponent
  ],
  template: `
    <div class="new-request-container">
      <app-page-header 
        title="Nouvelle Demande" 
        subtitle="Créez une nouvelle demande de service">
        <div slot="actions">
          <button mat-stroked-button routerLink="/agent/requests">
            <mat-icon>arrow_back</mat-icon>
            Retour
          </button>
        </div>
      </app-page-header>

      <div class="request-content">
        <mat-horizontal-stepper #stepper>
          <!-- Step 1: Service Selection -->
          <mat-step [stepControl]="serviceForm" label="Choisir un service">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Sélectionner le type de service</mat-card-title>
                <mat-card-subtitle>Choisissez le service pour lequel vous souhaitez faire une demande</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="serviceForm" class="service-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Service</mat-label>
                    <mat-select formControlName="serviceId" (selectionChange)="onServiceChange($event.value)">
                      <mat-option *ngFor="let service of services" [value]="service.id">
                        {{ service.name }} - {{ service.category }}
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="serviceForm.get('serviceId')?.hasError('required')">
                      Le service est requis
                    </mat-error>
                  </mat-form-field>

                  <div class="service-description" *ngIf="selectedService">
                    <h4>Description du service</h4>
                    <p>{{ selectedService.description }}</p>
                    
                    <div class="required-documents" *ngIf="selectedService.requiredDocuments.length > 0">
                      <h4>Documents requis</h4>
                      <ul>
                        <li *ngFor="let doc of selectedService.requiredDocuments">{{ doc }}</li>
                      </ul>
                    </div>
                  </div>
                </form>
              </mat-card-content>
              <mat-card-actions>
                <button mat-raised-button color="primary" matStepperNext [disabled]="serviceForm.invalid">
                  Suivant
                </button>
              </mat-card-actions>
            </mat-card>
          </mat-step>

          <!-- Step 2: Request Details -->
          <mat-step [stepControl]="requestForm" label="Détails de la demande">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Informations de la demande</mat-card-title>
                <mat-card-subtitle>Remplissez les détails de votre demande</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="requestForm" class="request-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Titre de la demande</mat-label>
                    <input matInput formControlName="title" placeholder="Ex: Demande de congé exceptionnel">
                    <mat-error *ngIf="requestForm.get('title')?.hasError('required')">
                      Le titre est requis
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Description détaillée</mat-label>
                    <textarea 
                      matInput 
                      formControlName="description" 
                      rows="4"
                      placeholder="Décrivez votre demande en détail..."></textarea>
                    <mat-error *ngIf="requestForm.get('description')?.hasError('required')">
                      La description est requise
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Priorité</mat-label>
                    <mat-select formControlName="priority">
                      <mat-option value="LOW">Faible</mat-option>
                      <mat-option value="MEDIUM">Normale</mat-option>
                      <mat-option value="HIGH">Élevée</mat-option>
                      <mat-option value="URGENT">Urgente</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <!-- Dynamic form fields based on selected service -->
                  <div class="dynamic-fields" *ngIf="selectedService">
                    <h4>Informations spécifiques</h4>
                    <div *ngFor="let field of selectedService.formFields" class="dynamic-field">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>{{ field.label }}</mat-label>
                        <input 
                          *ngIf="field.type === 'text' || field.type === 'email' || field.type === 'tel'"
                          matInput 
                          [type]="field.type"
                          [formControlName]="field.name"
                          [placeholder]="field.placeholder || ''">
                        <input 
                          *ngIf="field.type === 'date'"
                          matInput 
                          type="date"
                          [formControlName]="field.name">
                        <input 
                          *ngIf="field.type === 'number'"
                          matInput 
                          type="number"
                          [formControlName]="field.name"
                          [placeholder]="field.placeholder || ''">
                        <textarea 
                          *ngIf="field.type === 'textarea'"
                          matInput 
                          [formControlName]="field.name"
                          [placeholder]="field.placeholder || ''"
                          rows="3"></textarea>
                        <mat-select 
                          *ngIf="field.type === 'select'"
                          [formControlName]="field.name">
                          <mat-option *ngFor="let option of field.options" [value]="option">
                            {{ option }}
                          </mat-option>
                        </mat-select>
                        <mat-error *ngIf="requestForm.get(field.name)?.hasError('required') && field.required">
                          {{ field.label }} est requis
                        </mat-error>
                      </mat-form-field>
                    </div>
                  </div>
                </form>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button matStepperPrevious>Précédent</button>
                <button mat-raised-button color="primary" matStepperNext [disabled]="requestForm.invalid">
                  Suivant
                </button>
              </mat-card-actions>
            </mat-card>
          </mat-step>

          <!-- Step 3: Documents -->
          <mat-step label="Documents">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Documents justificatifs</mat-card-title>
                <mat-card-subtitle>Joignez les documents nécessaires à votre demande</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="document-upload-area">
                  <mat-icon class="upload-icon">cloud_upload</mat-icon>
                  <p>Glissez-déposez vos fichiers ici ou cliquez pour sélectionner</p>
                  <input type="file" multiple (change)="onFileSelect($event)" style="display: none;" #fileInput>
                  <button mat-stroked-button (click)="fileInput.click()">
                    <mat-icon>attach_file</mat-icon>
                    Sélectionner des fichiers
                  </button>
                </div>

                <div class="uploaded-files" *ngIf="uploadedFiles.length > 0">
                  <h4>Fichiers sélectionnés</h4>
                  <div class="file-list">
                    <div class="file-item" *ngFor="let file of uploadedFiles; let i = index">
                      <mat-icon>description</mat-icon>
                      <span class="file-name">{{ file.name }}</span>
                      <span class="file-size">({{ formatFileSize(file.size) }})</span>
                      <button mat-icon-button (click)="removeFile(i)" color="warn">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="required-docs-info" *ngIf="selectedService && selectedService.requiredDocuments.length > 0">
                  <h4>Documents requis pour ce service :</h4>
                  <ul>
                    <li *ngFor="let doc of selectedService.requiredDocuments">{{ doc }}</li>
                  </ul>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button matStepperPrevious>Précédent</button>
                <button mat-raised-button color="primary" matStepperNext>
                  Suivant
                </button>
              </mat-card-actions>
            </mat-card>
          </mat-step>

          <!-- Step 4: Review & Submit -->
          <mat-step label="Validation">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Récapitulatif de la demande</mat-card-title>
                <mat-card-subtitle>Vérifiez les informations avant de soumettre</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="review-section">
                  <div class="review-item">
                    <h4>Service sélectionné</h4>
                    <p>{{ selectedService?.name }} - {{ selectedService?.category }}</p>
                  </div>

                  <div class="review-item">
                    <h4>Titre</h4>
                    <p>{{ requestForm.get('title')?.value }}</p>
                  </div>

                  <div class="review-item">
                    <h4>Description</h4>
                    <p>{{ requestForm.get('description')?.value }}</p>
                  </div>

                  <div class="review-item">
                    <h4>Priorité</h4>
                    <p>{{ getPriorityLabel(requestForm.get('priority')?.value) }}</p>
                  </div>

                  <div class="review-item" *ngIf="uploadedFiles.length > 0">
                    <h4>Documents joints</h4>
                    <ul>
                      <li *ngFor="let file of uploadedFiles">{{ file.name }}</li>
                    </ul>
                  </div>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button matStepperPrevious>Précédent</button>
                <button 
                  mat-raised-button 
                  color="primary" 
                  (click)="submitRequest()"
                  [disabled]="isSubmitting">
                  <mat-icon *ngIf="isSubmitting">hourglass_empty</mat-icon>
                  {{ isSubmitting ? 'Envoi en cours...' : 'Soumettre la demande' }}
                </button>
              </mat-card-actions>
            </mat-card>
          </mat-step>
        </mat-horizontal-stepper>
      </div>
    </div>
  `,
  styles: [`
    .new-request-container {
      padding: 1rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .request-content {
      margin-top: 0;
    }

    .service-form,
    .request-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .service-description,
    .required-documents {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
    }

    .service-description h4,
    .required-documents h4 {
      margin: 0 0 0.5rem 0;
      color: #374151;
      font-size: 1rem;
    }

    .service-description p {
      margin: 0;
      color: #6b7280;
    }

    .required-documents ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #6b7280;
    }

    .dynamic-fields {
      margin-top: 2rem;
      border-top: 1px solid #e5e7eb;
      padding-top: 2rem;
    }

    .dynamic-fields h4 {
      margin: 0 0 1rem 0;
      color: #374151;
    }

    .dynamic-field {
      margin-bottom: 1rem;
    }

    .document-upload-area {
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 3rem 2rem;
      text-align: center;
      background: #f9fafb;
      margin-bottom: 2rem;
    }

    .upload-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #9ca3af;
      margin-bottom: 1rem;
    }

    .uploaded-files h4 {
      margin: 0 0 1rem 0;
      color: #374151;
    }

    .file-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
    }

    .file-name {
      flex: 1;
      font-size: 0.875rem;
    }

    .file-size {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .required-docs-info {
      margin-top: 2rem;
      padding: 1rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
    }

    .required-docs-info h4 {
      margin: 0 0 0.5rem 0;
      color: #1e40af;
    }

    .required-docs-info ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #1e40af;
    }

    .review-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .review-item h4 {
      margin: 0 0 0.5rem 0;
      color: #374151;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .review-item p,
    .review-item ul {
      margin: 0;
      color: #6b7280;
    }

    .review-item ul {
      padding-left: 1.5rem;
    }

    @media (max-width: 768px) {
      .new-request-container {
        padding: 0.5rem;
      }

      .document-upload-area {
        padding: 2rem 1rem;
      }
    }
  `]
})
export class NewRequestComponent implements OnInit {
  serviceForm: FormGroup;
  requestForm: FormGroup;
  services: Service[] = [];
  selectedService: Service | null = null;
  uploadedFiles: File[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private requestService: RequestService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.serviceForm = this.fb.group({
      serviceId: ['', Validators.required]
    });

    this.requestForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      priority: ['MEDIUM', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.requestService.getServices().subscribe({
      next: (services) => {
        this.services = services.filter(s => s.isActive);
      },
      error: (error) => {
        console.error('Error loading services:', error);
      }
    });
  }

  onServiceChange(serviceId: string): void {
    this.selectedService = this.services.find(s => s.id === serviceId) || null;
    
    if (this.selectedService) {
      // Add dynamic form fields
      this.selectedService.formFields.forEach(field => {
        const validators = field.required ? [Validators.required] : [];
        this.requestForm.addControl(field.name, this.fb.control('', validators));
      });
    }
  }

  onFileSelect(event: any): void {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.uploadedFiles.push(files[i]);
    }
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      'LOW': 'Faible',
      'MEDIUM': 'Normale',
      'HIGH': 'Élevée',
      'URGENT': 'Urgente'
    };
    return labels[priority] || priority;
  }

  submitRequest(): void {
    if (this.serviceForm.valid && this.requestForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const currentUser = this.authService.getCurrentUser();

      if (!currentUser) {
        this.snackBar.open('Erreur: utilisateur non connecté', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isSubmitting = false;
        return;
      }

      const requestData = {
        userId: currentUser.id,
        serviceId: this.serviceForm.value.serviceId,
        title: this.requestForm.value.title,
        description: this.requestForm.value.description,
        priority: this.requestForm.value.priority as RequestPriority,
        documents: [] // In a real app, upload files first
      };

      this.requestService.createRequest(requestData).subscribe({
        next: (request) => {
          this.isSubmitting = false;
          this.snackBar.open('Demande créée avec succès!', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/agent/requests', request.id]);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.snackBar.open('Erreur lors de la création de la demande', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}