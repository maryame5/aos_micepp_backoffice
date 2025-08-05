import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, PageHeaderComponent],
  template: `
    <div class="services-page">
      <app-page-header title="Nos Services" subtitle="Découvrez tous les services disponibles" [showActions]="false"></app-page-header>
      
      <div class="services-content">
        <div class="services-grid">
          <mat-card class="service-card" *ngFor="let service of services">
            <div class="service-icon">
              <mat-icon>{{ service.icon }}</mat-icon>
            </div>
            <mat-card-header>
              <mat-card-title>{{ service.title }}</mat-card-title>
              <mat-card-subtitle>{{ service.category }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>{{ service.description }}</p>
              <ul class="service-features">
                <li *ngFor="let feature of service.features">{{ feature }}</li>
              </ul>
            </mat-card-content>
            <mat-card-actions>
              <button mat-raised-button color="primary">Faire une demande</button>
              <button mat-button>En savoir plus</button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .services-page {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
    }

    .service-card {
      text-align: center;
      padding: 2rem;
      border-radius: 12px;
      border: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .service-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .service-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem auto;
    }

    .service-icon mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .service-features {
      text-align: left;
      margin: 1rem 0;
      padding-left: 1rem;
    }

    .service-features li {
      margin: 0.5rem 0;
      color: #64748b;
    }
  `]
})
export class ServicesComponent {
  services = [
    {
      icon: 'business_center',
      title: 'Congé exceptionnel',
      category: 'Ressources Humaines',
      description: 'Demandez un congé exceptionnel pour des raisons personnelles ou familiales.',
      features: ['Congé maladie', 'Congé familial', 'Congé personnel', 'Suivi en temps réel']
    },
    {
      icon: 'medical_services',
      title: 'Remboursement médical',
      category: 'Santé',
      description: 'Obtenez le remboursement de vos frais médicaux et de santé.',
      features: ['Consultation médicale', 'Médicaments', 'Analyses médicales', 'Remboursement rapide']
    },
    {
      icon: 'school',
      title: 'Formation professionnelle',
      category: 'Formation',
      description: 'Accédez aux programmes de formation et développement professionnel.',
      features: ['Formations certifiantes', 'Développement des compétences', 'Formations en ligne', 'Suivi personnalisé']
    },
    {
      icon: 'family_restroom',
      title: 'Aide sociale',
      category: 'Social',
      description: 'Bénéficiez d\'aides sociales pour vous et votre famille.',
      features: ['Aide financière', 'Support familial', 'Assistance sociale', 'Conseil et orientation']
    }
  ];
}