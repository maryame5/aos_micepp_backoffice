import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, PageHeaderComponent],
  template: `
    <div class="requests-container">
      <app-page-header 
        title="Gestion des Demandes" 
        subtitle="Traitez et gérez toutes les demandes des agents">
      </app-page-header>

      <mat-card>
        <mat-card-content>
          <p>Page de gestion des demandes en cours de développement...</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .requests-container {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }
  `]
})
export class AdminRequestsComponent {}