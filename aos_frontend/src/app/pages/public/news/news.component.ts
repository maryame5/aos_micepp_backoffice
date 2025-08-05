import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, PageHeaderComponent],
  template: `
    <div class="news-page">
      <app-page-header title="Actualités" subtitle="Restez informé de nos dernières nouvelles" [showActions]="false"></app-page-header>
      
      <div class="news-content">
        <div class="news-grid">
          <mat-card class="news-card" *ngFor="let article of articles">
            <img mat-card-image [src]="article.image" [alt]="article.title" class="news-image">
            <mat-card-header>
              <mat-card-title>{{ article.title }}</mat-card-title>
              <mat-card-subtitle>
                <mat-icon>calendar_today</mat-icon>
                {{ article.date | date:'dd/MM/yyyy' }}
                <mat-icon>person</mat-icon>
                {{ article.author }}
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="article-tags">
                <mat-chip *ngFor="let tag of article.tags">{{ tag }}</mat-chip>
              </div>
              <p>{{ article.excerpt }}</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary">Lire la suite</button>
              <button mat-icon-button>
                <mat-icon>share</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .news-page {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .news-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
    }

    .news-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .news-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .news-image {
      height: 200px;
      object-fit: cover;
    }

    .article-tags {
      margin-bottom: 1rem;
    }

    .article-tags mat-chip {
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
    }

    mat-card-subtitle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #64748b;
    }

    mat-card-subtitle mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }
  `]
})
export class NewsComponent {
  articles = [
    {
      title: 'Nouvelle plateforme de services en ligne',
      excerpt: 'Découvrez notre nouvelle interface modernisée pour une meilleure expérience utilisateur. Cette plateforme offre des services plus rapides et plus efficaces.',
      image: 'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=600',
      date: new Date(2024, 0, 15),
      author: 'Admin AOS',
      tags: ['Technologie', 'Innovation', 'Services']
    },
    {
      title: 'Extension des services médicaux',
      excerpt: 'De nouveaux services de santé sont maintenant disponibles pour tous les agents. Profitez d\'une couverture médicale étendue.',
      image: 'https://images.pexels.com/photos/305568/pexels-photo-305568.jpeg?auto=compress&cs=tinysrgb&w=600',
      date: new Date(2024, 0, 10),
      author: 'Dr. Amina Benali',
      tags: ['Santé', 'Services', 'Nouveautés']
    },
    {
      title: 'Programme de formation 2024',
      excerpt: 'Inscrivez-vous aux nouvelles formations professionnelles disponibles cette année. Développez vos compétences avec nos experts.',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600',
      date: new Date(2024, 0, 5),
      author: 'Équipe Formation',
      tags: ['Formation', 'Développement', 'Compétences']
    },
    {
      title: 'Amélioration des délais de traitement',
      excerpt: 'Grâce à nos nouvelles procédures, les délais de traitement des demandes ont été réduits de 40%. Une efficacité accrue pour tous.',
      image: 'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=600',
      date: new Date(2023, 11, 28),
      author: 'Équipe Qualité',
      tags: ['Efficacité', 'Amélioration', 'Processus']
    }
  ];
}