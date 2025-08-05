import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';

@Component({
  selector: 'app-admin-news',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, PageHeaderComponent],
  template: `
    <div class="news-container">
      <app-page-header 
        title="Gestion des Actualités" 
        subtitle="Créez et gérez les actualités de la plateforme">
        <div slot="actions">
          <button mat-raised-button color="primary">
            <mat-icon>add</mat-icon>
            Nouvelle actualité
          </button>
        </div>
      </app-page-header>

      <mat-card>
        <mat-card-content>
          <p>Page de gestion des actualités en cours de développement...</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .news-container {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }
  `]
})
export class AdminNewsComponent {}