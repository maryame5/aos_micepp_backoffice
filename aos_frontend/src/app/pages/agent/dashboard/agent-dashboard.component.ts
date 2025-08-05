import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RequestService } from '../../../services/request.service';
import { AuthService } from '../../../services/auth.service';
import { ServiceRequest, RequestStatus } from '../../../models/request.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>{{ getWelcomeMessage() }}</h1>
        <p>Voici un aperçu de vos activités récentes</p>
        <button class="primary-button" routerLink="/agent/new-request">
          ➕ Nouvelle demande
        </button>
      </div>

      <div class="loading" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Chargement...</p>
      </div>

      <div class="dashboard-content" *ngIf="!isLoading">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card pending">
            <div class="stat-content">
              <div class="stat-icon">⏳</div>
              <div class="stat-info">
                <div class="stat-number">{{ getRequestsByStatus('PENDING').length }}</div>
                <div class="stat-label">En attente</div>
              </div>
            </div>
          </div>

          <div class="stat-card in-progress">
            <div class="stat-content">
              <div class="stat-icon">🔄</div>
              <div class="stat-info">
                <div class="stat-number">{{ getRequestsByStatus('IN_PROGRESS').length }}</div>
                <div class="stat-label">En cours</div>
              </div>
            </div>
          </div>

          <div class="stat-card completed">
            <div class="stat-content">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <div class="stat-number">{{ getRequestsByStatus('COMPLETED').length + getRequestsByStatus('APPROVED').length }}</div>
                <div class="stat-label">Terminées</div>
              </div>
            </div>
          </div>

          <div class="stat-card total">
            <div class="stat-content">
              <div class="stat-icon">📋</div>
              <div class="stat-info">
                <div class="stat-number">{{ userRequests.length }}</div>
                <div class="stat-label">Total</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard Sections -->
        <div class="dashboard-sections">
          <!-- Recent Requests -->
          <div class="recent-requests-section">
            <div class="section-card">
              <div class="section-header">
                <h2>Mes demandes récentes</h2>
                <button class="text-button" routerLink="/agent/requests">Voir tout</button>
              </div>
              <div class="section-content">
                <div class="requests-list" *ngIf="userRequests.length > 0; else noRequests">
                  <div class="request-item" *ngFor="let request of getRecentRequests()">
                    <div class="request-info">
                      <h4 class="request-title">{{ request.title }}</h4>
                      <p class="request-description">{{ request.description | slice:0:100 }}...</p>
                      <div class="request-meta">
                        <span class="status-badge" [class]="getStatusClass(request.status)">
                          {{ getStatusLabel(request.status) }}
                        </span>
                        <span class="request-date">{{ request.createdAt | date:'dd/MM/yyyy' }}</span>
                      </div>
                    </div>
                    <div class="request-actions">
                      <button class="icon-button" [routerLink]="['/agent/requests', request.id]">
                        👁️
                      </button>
                    </div>
                  </div>
                </div>
                <ng-template #noRequests>
                  <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <p>Aucune demande trouvée</p>
                    <button class="primary-button" routerLink="/agent/new-request">
                      Créer ma première demande
                    </button>
                  </div>
                </ng-template>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions-section">
            <div class="section-card">
              <div class="section-header">
                <h2>Actions rapides</h2>
              </div>
              <div class="section-content">
                <div class="quick-actions-grid">
                  <button class="quick-action-btn" routerLink="/agent/new-request">
                    <div class="action-icon">➕</div>
                    <span>Nouvelle demande</span>
                  </button>
                  <button class="quick-action-btn" routerLink="/agent/requests">
                    <div class="action-icon">📋</div>
                    <span>Mes demandes</span>
                  </button>
                  <button class="quick-action-btn" routerLink="/agent/complaints">
                    <div class="action-icon">⚠️</div>
                    <span>Réclamations</span>
                  </button>
                  <button class="quick-action-btn" routerLink="/agent/documents">
                    <div class="action-icon">📄</div>
                    <span>Documents</span>
                  </button>
                  <button class="quick-action-btn" routerLink="/agent/profile">
                    <div class="action-icon">👤</div>
                    <span>Mon profil</span>
                  </button>
                  <button class="quick-action-btn" routerLink="/services">
                    <div class="action-icon">ℹ️</div>
                    <span>Services</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .dashboard-header h1 {
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .dashboard-header p {
      color: #64748b;
      margin-bottom: 1rem;
    }

    .loading {
      text-align: center;
      padding: 2rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f4f6;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      font-size: 2rem;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
    }

    .stat-label {
      color: #64748b;
      font-size: 0.875rem;
    }

    .dashboard-sections {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .section-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    .section-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-header h2 {
      margin: 0;
      color: #1e293b;
    }

    .section-content {
      padding: 1.5rem;
    }

    .requests-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .request-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .request-item:hover {
      border-color: #3b82f6;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
    }

    .request-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: #1e293b;
    }

    .request-description {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0 0 0.5rem 0;
    }

    .request-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.status-pending {
      background-color: #fef3c7;
      color: #92400e;
    }

    .status-badge.status-in-progress {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .status-badge.status-completed,
    .status-badge.status-approved {
      background-color: #d1fae5;
      color: #065f46;
    }

    .status-badge.status-rejected {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .request-date {
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
    }

    .quick-action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      color: inherit;
    }

    .quick-action-btn:hover {
      background: #e0e7ff;
      border-color: #3b82f6;
    }

    .action-icon {
      font-size: 2rem;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #64748b;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .primary-button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .primary-button:hover {
      background: #2563eb;
    }

    .text-button {
      background: none;
      border: none;
      color: #3b82f6;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .text-button:hover {
      text-decoration: underline;
    }

    .icon-button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background-color 0.3s ease;
    }

    .icon-button:hover {
      background: #f3f4f6;
    }

    @media (max-width: 1024px) {
      .dashboard-sections {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 0.5rem;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .quick-actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .request-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }
  `]
})
export class AgentDashboardComponent implements OnInit {
  userRequests: ServiceRequest[] = [];
  currentUser: User | null = null;
  isLoading = true;

  constructor(
    private requestService: RequestService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUserRequests();
  }

  loadUserRequests(): void {
    if (this.currentUser) {
      this.requestService.getUserRequests(this.currentUser.id).subscribe({
        next: (requests) => {
          this.userRequests = requests;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading requests:', error);
          this.isLoading = false;
        }
      });
    }
  }

  getWelcomeMessage(): string {
    const hour = new Date().getHours();
    let greeting = 'Bonjour';
    if (hour >= 12 && hour < 17) greeting = 'Bon après-midi';
    else if (hour >= 17) greeting = 'Bonsoir';

    return `${greeting}, ${this.currentUser?.firstName || 'Agent'}`;
  }

  getRequestsByStatus(status: string): ServiceRequest[] {
    return this.userRequests.filter(req => req.status === status);
  }

  getRecentRequests(): ServiceRequest[] {
    return this.userRequests
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }

  getStatusLabel(status: RequestStatus): string {
    const labels: Record<RequestStatus, string> = {
      [RequestStatus.PENDING]: 'En attente',
      [RequestStatus.IN_PROGRESS]: 'En cours',
      [RequestStatus.APPROVED]: 'Approuvée',
      [RequestStatus.REJECTED]: 'Rejetée',
      [RequestStatus.COMPLETED]: 'Terminée'
    };
    return labels[status];
  }

  getStatusClass(status: RequestStatus): string {
    return `status-${status.toLowerCase().replace('_', '-')}`;
  }
}