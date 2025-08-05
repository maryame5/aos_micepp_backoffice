import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, PageHeaderComponent],
  template: `
    <div class="services-container">
      <app-page-header 
        title="Gestion des Services" 
        subtitle="Configurez et gérez les services disponibles">
        <div slot="actions">
          <button mat-raised-button color="primary">
            <mat-icon>add</mat-icon>
            Nouveau service
          </button>
        </div>
      </app-page-header>

      <mat-card>
        <mat-card-content>
          <p>Page de gestion des services en cours de développement...</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .services-container {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }
  `]
})
export class AdminServicesComponent {}