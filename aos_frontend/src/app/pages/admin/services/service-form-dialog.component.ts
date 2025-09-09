import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { AdminServiceService, ServiceDTO, CreateServiceRequest, UpdateServiceRequest } from '../../../services/admin-service.service';

interface DialogData {
  mode: 'create' | 'edit';
  service?: ServiceDTO;
}

@Component({
  selector: 'app-service-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mode === 'create' ? 'Créer un nouveau service' : 'Modifier le service' }}
    </h2>

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="serviceForm" class="service-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nom du service</mat-label>
          <input matInput formControlName="nom" placeholder="Ex: Transport du personnel">
          <mat-error *ngIf="serviceForm.get('nom')?.hasError('required')">
            Le nom du service est obligatoire
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width" *ngIf="data.mode === 'create'">
          <mat-label>Type de service</mat-label>
          <mat-select formControlName="type">
            <mat-option *ngFor="let type of serviceTypes" [value]="type">
              {{ getServiceTypeLabel(type) }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="serviceForm.get('type')?.hasError('required')">
            Le type de service est obligatoire
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Titre d'affichage</mat-label>
          <input matInput formControlName="title" placeholder="Ex: Service de Transport">
          <mat-error *ngIf="serviceForm.get('title')?.hasError('required')">
            Le titre est obligatoire
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Icône</mat-label>
          <mat-select formControlName="icon">
            <mat-option *ngFor="let icon of availableIcons" [value]="icon.value">
              <mat-icon>{{ icon.value }}</mat-icon>
              {{ icon.label }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="serviceForm.get('icon')?.hasError('required')">
            L'icône est obligatoire
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea 
            matInput 
            formControlName="description" 
            rows="3"
            placeholder="Description du service...">
          </textarea>
          <mat-error *ngIf="serviceForm.get('description')?.hasError('required')">
            La description est obligatoire
          </mat-error>
        </mat-form-field>

        <div class="features-section">
          <h3>Fonctionnalités</h3>
          <div formArrayName="features">
            <div 
              *ngFor="let feature of featuresFormArray.controls; let i = index" 
              class="feature-item">
              <mat-form-field appearance="outline" class="feature-input">
                <mat-label>Fonctionnalité {{ i + 1 }}</mat-label>
                <input matInput [formControlName]="i" placeholder="Ex: Prise en charge domicile-travail">
              </mat-form-field>
              <button 
                mat-icon-button 
                type="button" 
                color="warn" 
                (click)="removeFeature(i)"
                [disabled]="featuresFormArray.length <= 1">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
          <button 
            mat-stroked-button 
            type="button" 
            (click)="addFeature()" 
            class="add-feature-btn">
            <mat-icon>add</mat-icon>
            Ajouter une fonctionnalité
          </button>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions class="dialog-actions">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button 
        mat-raised-button 
        color="primary" 
        (click)="onSave()" 
        [disabled]="!serviceForm.valid || loading">
        {{ loading ? 'En cours...' : (data.mode === 'create' ? 'Créer' : 'Modifier') }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-content {
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
      font-size: 16px;
    }
    .service-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      font-size: 16px;
    }

    .full-width {
      width: 100%;
    }

    .features-section {
      margin-top: 1rem;
    }

    .features-section h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-weight: 500;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .feature-input {
      flex: 1;
    }

    .add-feature-btn {
      margin-top: 0.5rem;
    }

    .dialog-actions {
      justify-content: flex-end;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
    }

    mat-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `]
})
export class ServiceFormDialogComponent implements OnInit {
  serviceForm: FormGroup;
  serviceTypes: string[] = [];
  loading = false;

  availableIcons = [
    { value: 'directions_bus', label: 'Transport' },
    { value: 'local_hospital', label: 'Santé' },
    { value: 'home', label: 'Logement' },
    { value: 'beach_access', label: 'Vacances' },
    { value: 'school', label: 'Éducation' },
    { value: 'sports', label: 'Sport' },
    { value: 'business', label: 'Business' },
    { value: 'support', label: 'Support' }
  ];

  constructor(
    private fb: FormBuilder,
    private adminServiceService: AdminServiceService,
    public dialogRef: MatDialogRef<ServiceFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.serviceForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadServiceTypes();
    if (this.data.mode === 'edit' && this.data.service) {
      this.populateForm(this.data.service);
    }
  }

  get featuresFormArray(): FormArray {
    return this.serviceForm.get('features') as FormArray;
  }

  createForm(): FormGroup {
    return this.fb.group({
      nom: ['', [Validators.required]],
      type: [{ value: '', disabled: this.data.mode === 'edit' }, [Validators.required]],
      title: ['', [Validators.required]],
      icon: ['business', [Validators.required]],
      description: ['', [Validators.required]],
      features: this.fb.array([this.createFeatureControl()])
    });
  }

  createFeatureControl(): FormGroup {
    return this.fb.group({
      0: ['', [Validators.required]]
    });
  }

  loadServiceTypes(): void {
    this.adminServiceService.getAvailableServiceTypes().subscribe({
      next: (types) => {
        this.serviceTypes = types;
      },
      error: (error) => {
        console.error('Error loading service types:', error);
      }
    });
  }

  populateForm(service: ServiceDTO): void {
    this.serviceForm.patchValue({
      nom: service.nom,
      type: service.type,
      title: service.title,
      icon: service.icon,
      description: service.description
    });

    // Clear existing features
    while (this.featuresFormArray.length > 0) {
      this.featuresFormArray.removeAt(0);
    }

    // Add features
    service.features.forEach(feature => {
      this.featuresFormArray.push(this.fb.control(feature, [Validators.required]));
    });

    if (this.featuresFormArray.length === 0) {
      this.addFeature();
    }
  }

  addFeature(): void {
    this.featuresFormArray.push(this.fb.control('', [Validators.required]));
  }

  removeFeature(index: number): void {
    if (this.featuresFormArray.length > 1) {
      this.featuresFormArray.removeAt(index);
    }
  }

  getServiceTypeLabel(type: string): string {
    const typeLabels: { [key: string]: string } = {
      'TransportService': 'Service de Transport',
      'SanteSocialeService': 'Service Santé et Social',
      'LogementService': 'Service Logement',
      'ColonieVacanceService': 'Service Colonie de Vacances',
      'AppuiScolaireService': 'Service Appui Scolaire',
      'ActiviteCulturelleSportiveService': 'Service Activités Culturelles et Sportives'
    };
    return typeLabels[type] || type;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.serviceForm.valid) {
      this.loading = true;
      const formValue = this.serviceForm.value;
      
      if (this.data.mode === 'create') {
        const createRequest: CreateServiceRequest = {
          nom: formValue.nom,
          type: formValue.type,
          title: formValue.title,
          icon: formValue.icon,
          description: formValue.description,
          features: formValue.features
        };

        this.adminServiceService.createService(createRequest).subscribe({
          next: (result) => {
            this.loading = false;
            this.dialogRef.close(result);
          },
          error: (error) => {
            this.loading = false;
            console.error('Error creating service:', error);
          }
        });
      } else if (this.data.service?.id) {
        const updateRequest: UpdateServiceRequest = {
          nom: formValue.nom,
          title: formValue.title,
          icon: formValue.icon,
          description: formValue.description,
          features: formValue.features
        };

        this.adminServiceService.updateService(this.data.service.id, updateRequest).subscribe({
          next: (result) => {
            this.loading = false;
            this.dialogRef.close(result);
          },
          error: (error) => {
            this.loading = false;
            console.error('Error updating service:', error);
          }
        });
      }
    }
  }
}