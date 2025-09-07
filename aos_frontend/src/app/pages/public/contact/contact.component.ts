import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MessagesService, MessageContact } from '../../../services/messages.service';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';

// Composant pour voir les détails du message
@Component({
  selector: 'app-message-detail',
  standalone: true,
   imports: [CommonModule,
     MatDialogModule, MatButtonModule, MatIconModule, MatChipsModule],

  template: `
    <div class="message-detail-dialog">
      <h2 mat-dialog-title>Détails du message</h2>
      <mat-dialog-content>
        <div class="detail-grid">
          <div class="detail-item">
            <label>Nom complet:</label>
            <span>{{ data.prenom }} {{ data.nom }}</span>
          </div>
          <div class="detail-item">
            <label>Email:</label>
            <span>{{ data.email }}</span>
          </div>
          <div class="detail-item">
            <label>Téléphone:</label>
            <span>{{ data.telephone || 'Non renseigné' }}</span>
          </div>
          <div class="detail-item">
            <label>Sujet:</label>
            <mat-chip [color]="getSubjectColor(data.sujet)">{{ getSubjectLabel(data.sujet) }}</mat-chip>
          </div>
          <div class="detail-item">
            <label>Date:</label>
            <span>{{ formatDate(data.createdDate) }}</span>
          </div>
          <div class="detail-item full-width">
            <label>Message:</label>
            <div class="message-content">{{ getMessageText(data) }}</div>
          </div>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="closeDialog()">Fermer</button>
        <button mat-raised-button color="primary" (click)="replyToMessage()">
          <mat-icon>reply</mat-icon>
          Répondre
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .message-detail-dialog {
      max-width: 600px;
      width: 100%;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
      margin: 1rem 0;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .detail-item.full-width {
      grid-column: 1 / -1;
    }
    .detail-item label {
      font-weight: 600;
      color: #666;
      font-size: 0.875rem;
    }
    .detail-item span {
      font-size: 1rem;
    }
    .message-content {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 8px;
      white-space: pre-wrap;
      line-height: 1.6;
    }
  `],
 })
export class MessageDetailComponent  {
  
  
 constructor(
    private dialogRef: MatDialogRef<MessageDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

  }

  closeDialog() {
    this.dialogRef.close();
  }

  replyToMessage() {
    const subject = encodeURIComponent(`Re: ${this.getSubjectLabel(this.data.sujet)}`);
    const messageText = this.getMessageText(this.data);
    const body = encodeURIComponent(`
Bonjour ${this.data.prenom} ${this.data.nom},

Merci pour votre message concernant "${this.getSubjectLabel(this.data.sujet)}".

Message original:
"${messageText}"

Cordialement,
L'équipe AOS-MICEPP
    `);
    
    window.location.href = `mailto:${this.data.email}?subject=${subject}&body=${body}`;
  }

  getSubjectLabel(subject: string): string {
    const labels: { [key: string]: string } = {
      'information': 'Demande d\'information',
      'support': 'Support technique',
      'complaint': 'Réclamation',
      'suggestion': 'Suggestion',
      'other': 'Autre'
    };
    return labels[subject] || subject;
  }

  getSubjectColor(subject: string): string {
    const colors: { [key: string]: string } = {
      'information': 'primary',
      'support': 'accent',
      'complaint': 'warn',
      'suggestion': 'primary',
      'other': ''
    };
    return colors[subject] || '';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('fr-FR');
  }

  // Helper method to get message text from either 'message' or 'Message' property
  getMessageText(messageObj: any): string {
    return messageObj?.message || messageObj?.Message || '';
  }
}

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    PageHeaderComponent
  ],
  template: `
    <div class="messages-page">
      <app-page-header 
        title="Messages de Contact" 
        subtitle="Gestion des messages reçus via le formulaire de contact"
        [showActions]="false">
      </app-page-header>
      
      <div class="messages-content">
        <mat-card class="messages-card">
          <mat-card-header>
            <mat-card-title class="card-title">
              <span>Liste des messages ({{ messages.length }})</span>
              <button mat-icon-button (click)="loadMessages()" [disabled]="loading">
                <mat-icon>refresh</mat-icon>
              </button>
            </mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div *ngIf="loading" class="loading-container">
              <mat-spinner></mat-spinner>
              <p>Chargement des messages...</p>
            </div>

            <div *ngIf="!loading && messages.length === 0" class="no-messages">
              <mat-icon>inbox</mat-icon>
              <h3>Aucun message</h3>
              <p>Aucun message de contact n'a été reçu pour le moment.</p>
            </div>

            <div *ngIf="!loading && messages.length > 0" class="table-container">
              <table mat-table [dataSource]="messages" class="messages-table">
                
                <!-- Date Column -->
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let message">
                    {{ formatDate(message.createdDate) }}
                  </td>
                </ng-container>

                <!-- Nom Column -->
                <ng-container matColumnDef="nom">
                  <th mat-header-cell *matHeaderCellDef>Nom</th>
                  <td mat-cell *matCellDef="let message">
                    {{ message.prenom }} {{ message.nom }}
                  </td>
                </ng-container>

                <!-- Email Column -->
                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef>Email</th>
                  <td mat-cell *matCellDef="let message">
                    <a [href]="'mailto:' + message.email" class="email-link">
                      {{ message.email }}
                    </a>
                  </td>
                </ng-container>

                <!-- Sujet Column -->
                <ng-container matColumnDef="sujet">
                  <th mat-header-cell *matHeaderCellDef>Sujet</th>
                  <td mat-cell *matCellDef="let message">
                    <mat-chip [color]="getSubjectColor(message.sujet)">
                      {{ getSubjectLabel(message.sujet) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Message Preview Column -->
                <ng-container matColumnDef="message">
                  <th mat-header-cell *matHeaderCellDef>Message</th>
                  <td mat-cell *matCellDef="let message">
                    <span class="message-preview">
                      {{ getMessagePreview(message) }}
                    </span>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let message">
                    <button 
                      mat-icon-button 
                      (click)="viewMessage(message)"
                      matTooltip="Voir les détails">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button 
                      mat-icon-button 
                      (click)="replyToMessage(message)"
                      matTooltip="Répondre">
                      <mat-icon>reply</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                    (click)="viewMessage(row)" 
                    class="clickable-row">
                </tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .messages-page {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .messages-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .card-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 3rem;
    }

    .no-messages {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 3rem;
      color: #666;
      text-align: center;
    }

    .no-messages mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      opacity: 0.5;
    }

    .table-container {
      overflow-x: auto;
    }

    .messages-table {
      width: 100%;
      margin-top: 1rem;
    }

    .clickable-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .clickable-row:hover {
      background-color: #f5f5f5;
    }

    .email-link {
      color: #1976d2;
      text-decoration: none;
    }

    .email-link:hover {
      text-decoration: underline;
    }

    .message-preview {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: inline-block;
    }

    @media (max-width: 768px) {
      .messages-page {
        padding: 0.5rem;
      }
      
      .message-preview {
        max-width: 100px;
      }
    }
  `]
})
export class AdminMessagesComponent implements OnInit {
  messages: MessageContact[] = [];
  loading = false;
  displayedColumns: string[] = ['date', 'nom', 'email', 'sujet', 'message', 'actions'];

  private messagesService = inject(MessagesService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    this.loading = true;
    
    this.messagesService.getAllMessages().subscribe({
      next: (response) => {
        this.messages = response;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur lors du chargement des messages:', error);
        
        let errorMessage = 'Erreur lors du chargement des messages.';
        if (error.status === 401) {
          errorMessage = 'Accès non autorisé. Veuillez vous reconnecter.';
        } else if (error.status === 403) {
          errorMessage = 'Accès interdit. Vous n\'avez pas les permissions nécessaires.';
        } else if (error.status === 500) {
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        }
        
        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  viewMessage(message: MessageContact) {
    const dialogRef = this.dialog.open(MessageDetailComponent, {
      width: '600px',
      data: message
    });
  }

  replyToMessage(message: MessageContact) {
    // Get the message text safely
    const messageText = this.getMessageText(message);
    
    // Ouvrir l'application de messagerie par défaut
    const subject = encodeURIComponent(`Re: ${this.getSubjectLabel(message.sujet)}`);
    const body = encodeURIComponent(`
Bonjour ${message.prenom} ${message.nom},

Merci pour votre message concernant "${this.getSubjectLabel(message.sujet)}".

Message original:
"${messageText}"

Cordialement,
L'équipe AOS-MICEPP
    `);
    
    window.location.href = `mailto:${message.email}?subject=${subject}&body=${body}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getSubjectLabel(subject: string): string {
    const labels: { [key: string]: string } = {
      'information': 'Demande d\'information',
      'support': 'Support technique',
      'complaint': 'Réclamation',
      'suggestion': 'Suggestion',
      'other': 'Autre'
    };
    return labels[subject] || subject;
  }

  getSubjectColor(subject: string): string {
    const colors: { [key: string]: string } = {
      'information': 'primary',
      'support': 'accent',
      'complaint': 'warn',
      'suggestion': 'primary',
      'other': ''
    };
    return colors[subject] || '';
  }

  // Helper method to safely get message text from either 'message' or 'Message' property
  getMessageText(messageObj: any): string {
    return messageObj?.message || messageObj?.Message || '';
  }

  // Fixed getMessagePreview method with proper null/undefined checking
  getMessagePreview(messageObj: any): string {
    const message = this.getMessageText(messageObj);
    if (!message || typeof message !== 'string') {
      return 'Aucun message';
    }
    return message.length > 50 ? message.substring(0, 50) + '...' : message;
  }
}