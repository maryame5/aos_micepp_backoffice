import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    PageHeaderComponent
  ],
  template: `
    <div class="contact-page">
      <app-page-header title="Contactez-nous" subtitle="Notre équipe est à votre disposition" [showActions]="false"></app-page-header>
      
      <div class="contact-content">
        <div class="contact-grid">
          <!-- Contact Form -->
          <mat-card class="contact-form-card">
            <mat-card-header>
              <mat-card-title>Envoyez-nous un message</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="contact-form">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Nom</mat-label>
                    <input matInput formControlName="lastName" required>
                    <mat-error *ngIf="contactForm.get('lastName')?.hasError('required')">
                      Le nom est requis
                    </mat-error>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Prénom</mat-label>
                    <input matInput formControlName="firstName" required>
                    <mat-error *ngIf="contactForm.get('firstName')?.hasError('required')">
                      Le prénom est requis
                    </mat-error>
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email" required>
                  <mat-icon matSuffix>email</mat-icon>
                  <mat-error *ngIf="contactForm.get('email')?.hasError('required')">
                    L'email est requis
                  </mat-error>
                  <mat-error *ngIf="contactForm.get('email')?.hasError('email')">
                    Format d'email invalide
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Téléphone</mat-label>
                  <input matInput type="tel" formControlName="phone">
                  <mat-icon matSuffix>phone</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Sujet</mat-label>
                  <mat-select formControlName="subject" required>
                    <mat-option value="information">Demande d'information</mat-option>
                    <mat-option value="support">Support technique</mat-option>
                    <mat-option value="complaint">Réclamation</mat-option>
                    <mat-option value="suggestion">Suggestion</mat-option>
                    <mat-option value="other">Autre</mat-option>
                  </mat-select>
                  <mat-error *ngIf="contactForm.get('subject')?.hasError('required')">
                    Le sujet est requis
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Message</mat-label>
                  <textarea matInput formControlName="message" rows="6" required></textarea>
                  <mat-error *ngIf="contactForm.get('message')?.hasError('required')">
                    Le message est requis
                  </mat-error>
                </mat-form-field>

                <button 
                  mat-raised-button 
                  color="primary" 
                  type="submit" 
                  class="submit-btn"
                  [disabled]="contactForm.invalid || isSubmitting">
                  <mat-icon *ngIf="isSubmitting">hourglass_empty</mat-icon>
                  <span>{{ isSubmitting ? 'Envoi en cours...' : 'Envoyer le message' }}</span>
                </button>
              </form>
            </mat-card-content>
          </mat-card>

          <!-- Contact Info -->
          <div class="contact-info-section">
            <mat-card class="contact-info-card">
              <mat-card-header>
                <mat-card-title>Informations de contact</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="contact-item">
                  <mat-icon>location_on</mat-icon>
                  <div class="contact-details">
                    <h4>Adresse</h4>
                    <p>Avenue Mohammed V<br>Rabat, Maroc</p>
                  </div>
                </div>

                <div class="contact-item">
                  <mat-icon>phone</mat-icon>
                  <div class="contact-details">
                    <h4>Téléphone</h4>
                    <p>+212 5XX XX XX XX</p>
                  </div>
                </div>

                <div class="contact-item">
                  <mat-icon>email</mat-icon>
                  <div class="contact-details">
                    <h4>Email</h4>
                    <p>contact aos-micepp.ma</p>
                  </div>
                </div>

                <div class="contact-item">
                  <mat-icon>schedule</mat-icon>
                  <div class="contact-details">
                    <h4>Horaires d'ouverture</h4>
                    <p>Lundi - Vendredi: 8h00 - 17h00<br>
                       Samedi: 8h00 - 12h00</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="faq-card">
              <mat-card-header>
                <mat-card-title>Questions fréquentes</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="faq-item" *ngFor="let faq of faqs">
                  <h4 class="faq-question">{{ faq.question }}</h4>
                  <p class="faq-answer">{{ faq.answer }}</p>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contact-page {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .contact-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .contact-form-card,
    .contact-info-card,
    .faq-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .contact-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      width: 100%;
    }

    .submit-btn {
      margin-top: 1rem;
      padding: 0.75rem 2rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .contact-item mat-icon {
      color: #3b82f6;
      margin-top: 0.25rem;
    }

    .contact-details h4 {
      margin: 0 0 0.5rem 0;
      font-weight: 600;
      color: #1e293b;
    }

    .contact-details p {
      margin: 0;
      color: #64748b;
      line-height: 1.5;
    }

    .faq-item {
      margin-bottom: 1.5rem;
    }

    .faq-question {
      margin: 0 0 0.5rem 0;
      font-weight: 600;
      color: #1e293b;
      font-size: 0.875rem;
    }

    .faq-answer {
      margin: 0;
      color: #64748b;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    @media (max-width: 1024px) {
      .contact-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .contact-page {
        padding: 0.5rem;
      }
    }
  `]
})
export class ContactComponent {
  contactForm: FormGroup;
  isSubmitting = false;

  faqs = [
    {
      question: 'Comment créer un compte agent ?',
      answer: 'Contactez votre administrateur RH pour obtenir vos identifiants de connexion.'
    },
    {
      question: 'Combien de temps pour traiter une demande ?',
      answer: 'Le délai moyen de traitement est de 5 à 10 jours ouvrables selon le type de demande.'
    },
    {
      question: 'Comment suivre l\'état de ma demande ?',
      answer: 'Connectez-vous à votre espace agent et consultez la section "Mes demandes".'
    },
    {
      question: 'Que faire en cas de problème technique ?',
      answer: 'Contactez notre support technique via ce formulaire en sélectionnant "Support technique".'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.contactForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      // Simulate form submission
      setTimeout(() => {
        this.isSubmitting = false;
        this.snackBar.open('Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.', 'Fermer', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.contactForm.reset();
      }, 2000);
    }
  }
}