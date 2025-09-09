import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';
import { LoadingComponent } from '../../../components/shared/loading/loading.component';
import { RequestService } from '../../../services/request.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { DashboardService } from '../../../services/dashboard.service';
import { ServiceRequest } from '../../../models/request.model';
import { Demande } from '../../../services/request.service';
import { User, UserDTO, UserRole } from '../../../models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    PageHeaderComponent,
    LoadingComponent
  ],
  template: `
    <div class="admin-dashboard-container">
      <app-page-header 
        [title]="getWelcomeMessage()" 
        [subtitle]="getUserRoleMessage()">
      </app-page-header>

      <app-loading *ngIf="isLoading"></app-loading>

      <div class="dashboard-content" *ngIf="!isLoading">
        <!-- Stats Overview -->
        <div class="stats-grid">
          <mat-card class="stat-card users">
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>people</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ totalUsers }}</div>
                <div class="stat-label">Utilisateurs</div>
                <div class="stat-change positive">+{{ usersChangeThisMonth }} ce mois</div>
              </div>
            </div>
          </mat-card>

          <mat-card class="stat-card requests">
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>assignment</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ totalRequests }}</div>
                <div class="stat-label">Demandes</div>
                <div class="stat-change positive">+{{ requestsChangeToday }} aujourd'hui</div>
              </div>
            </div>
          </mat-card>

          <mat-card class="stat-card pending">
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>hourglass_empty</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ pendingRequests }}</div>
                <div class="stat-label">En attente</div>
                <div class="stat-change neutral">Nécessite attention</div>
              </div>
            </div>
          </mat-card>

          <mat-card class="stat-card satisfaction">
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>sentiment_very_satisfied</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ satisfactionRate }}%</div>
                <div class="stat-label">Satisfaction</div>
                <div class="stat-change positive">+{{ satisfactionChangeThisMonth }}% ce mois</div>
              </div>
            </div>
          </mat-card>
        </div>

        <!-- Charts and Recent Activity -->
        <div class="dashboard-sections">
          <!-- Recent Requests -->
          <div class="recent-section" *ngIf="isAdmin()">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Demandes récentes</mat-card-title>
                <div class="card-actions">
                  <button mat-button routerLink="/admin/requests">Voir tout</button>
                </div>
              </mat-card-header>
              <mat-card-content>
                <div class="requests-list" *ngIf="recentRequests.length > 0; else noRequests">
                  <div class="request-item" *ngFor="let request of recentRequests">
                    <div class="request-info">
                      <h4 class="request-title">{{ request.serviceNom }}</h4>
                      <p class="request-description">{{ request.description | slice:0:80 }}...</p>
                      <div class="request-meta">
                        <mat-chip [class]="getStatusClass(request.statut)">
                          {{ getStatusLabel(request.statut) }}
                        </mat-chip>
                        <span class="request-date">{{ request.dateSoumission | date:'dd/MM/yyyy' }}</span>
                        <span class="request-user">
                          Par: {{ request.utilisateurNom }}
                        </span>
                      </div>
                    </div>
                    <div class="request-actions">
                      <button mat-icon-button [routerLink]="['/admin/requests', request.id]">
                        <mat-icon>visibility</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
                <ng-template #noRequests>
                  <div class="empty-state">
                    <mat-icon class="empty-icon">assignment</mat-icon>
                    <p>Aucune demande récente</p>
                  </div>
                </ng-template>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Recent Requests -->
          <div class="recent-section" >
            <mat-card>
              <mat-card-header>
                <mat-card-title>Demandes assignées</mat-card-title>
                <div class="card-actions">
                  <button mat-button routerLink="/admin/my-requests">Voir tout</button>
                </div>
              </mat-card-header>
              <mat-card-content>
                <div class="requests-list" *ngIf="recentassignesRequest.length > 0; else noRequests">
                  <div class="request-item" *ngFor="let request of recentassignesRequest">
                    <div class="request-info">
                      <h4 class="request-title">{{ request.serviceNom }}</h4>
                      <p class="request-description">{{ request.description | slice:0:80 }}...</p>
                      <div class="request-meta">
                        <mat-chip [class]="getStatusClass(request.statut)">
                          {{ getStatusLabel(request.statut) }}
                        </mat-chip>
                        <span class="request-date">{{ request.dateSoumission | date:'dd/MM/yyyy' }}</span>
                        <span class="request-user">
                          Par: {{ request.utilisateurNom }}
                        </span>
                      </div>
                    </div>
                    <div class="request-actions">
                      <button mat-icon-button [routerLink]="['/admin/requests', request.id]">
                        <mat-icon>visibility</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
                <ng-template #noRequests>
                  <div class="empty-state">
                    <mat-icon class="empty-icon">assignment</mat-icon>
                    <p>Aucune demande récente</p>
                  </div>
                </ng-template>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Quick Actions -->
          <div class="actions-section">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Actions rapides</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="quick-actions-grid">
                  <button mat-stroked-button class="quick-action-btn" routerLink="/admin/users" *ngIf="isAdmin()">
                    <mat-icon>person_add</mat-icon>
                    Nouvel utilisateur
                  </button>
                  <button mat-stroked-button class="quick-action-btn" routerLink="/admin/requests" *ngIf="isAdmin()">
                    <mat-icon>assignment</mat-icon>
                    Gérer demandes
                  </button>

                  <button mat-stroked-button class="quick-action-btn" routerLink="/admin/my-requests">
                    <mat-icon>list_alt</mat-icon>
                    Mes demandes
                  </button>

                  <button mat-stroked-button class="quick-action-btn" routerLink="/admin/complaints">
                    <mat-icon>support_agent</mat-icon>
                    Réclamations
                  </button>
                  <button mat-stroked-button class="quick-action-btn" routerLink="/admin/services" *ngIf="isAdmin()">
                    <mat-icon>business_center</mat-icon>
                    Services
                  </button>
                  <button mat-stroked-button class="quick-action-btn" routerLink="/admin/news" *ngIf="isAdmin()">
                    <mat-icon>article</mat-icon>
                    Actualités
                  </button>
                  <button mat-stroked-button class="quick-action-btn">
                    <mat-icon>analytics</mat-icon>
                    Rapports
                  </button>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- System Status -->
            <mat-card class="system-status-card">
              <mat-card-header>
                <mat-card-title>État du système</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="status-items">
                  <div class="status-item">
                    <div class="status-indicator" [class]="systemStatus?.server || 'online'"></div>
                    <span>Serveur principal</span>
                    <span class="status-value">{{ getStatusLabel(systemStatus?.server) }}</span>
                  </div>
                  <div class="status-item">
                    <div class="status-indicator" [class]="systemStatus?.database || 'online'"></div>
                    <span>Base de données</span>
                    <span class="status-value">{{ getStatusLabel(systemStatus?.database) }}</span>
                  </div>
                  <div class="status-item">
                    <div class="status-indicator" [class]="systemStatus?.storage?.status || 'warning'"></div>
                    <span>Stockage</span>
                    <span class="status-value">{{ systemStatus?.storage?.usagePercentage || 75 }}% utilisé</span>
                  </div>
                  <div class="status-item">
                    <div class="status-indicator" [class]="systemStatus?.api || 'online'"></div>
                    <span>API</span>
                    <span class="status-value">{{ getStatusLabel(systemStatus?.api) }}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard-container {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      padding: 1.5rem;
      border-radius: 12px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-left: 4px solid;
    }

    .stat-card.users {
      border-left-color: #3b82f6;
    }

    .stat-card.requests {
      border-left-color: #8b5cf6;
    }

    .stat-card.pending {
      border-left-color: #f59e0b;
    }

    .stat-card.satisfaction {
      border-left-color: #10b981;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .stat-card.requests .stat-icon {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
    }

    .stat-card.pending .stat-icon {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .stat-card.satisfaction .stat-icon {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
    }

    .stat-label {
      color: #64748b;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .stat-change {
      font-size: 0.75rem;
      font-weight: 500;
    }

    .stat-change.positive {
      color: #059669;
    }

    .stat-change.neutral {
      color: #f59e0b;
    }

    .dashboard-sections {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .recent-section mat-card,
    .actions-section mat-card,
    .system-status-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .card-actions {
      margin-left: auto;
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
      flex-wrap: wrap;
    }

    .request-date {
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .request-user {
      font-size: 0.75rem;
      color: #6b7280;
      font-style: italic;
    }

    .mat-chip.status-pending {
      background-color: #fef3c7 !important;
      color: #92400e !important;
    }

    .mat-chip.status-in-progress {
      background-color: #dbeafe !important;
      color: #1e40af !important;
    }

    .mat-chip.status-completed,
    .mat-chip.status-approved {
      background-color: #d1fae5 !important;
      color: #065f46 !important;
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
      height: auto;
      text-align: center;
    }

    .quick-action-btn mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .status-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.875rem;
    }

    .status-indicator {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;
    }

    .status-indicator.online {
      background-color: #10b981;
    }

    .status-indicator.warning {
      background-color: #f59e0b;
    }

    .status-indicator.offline {
      background-color: #ef4444;
    }

    .status-value {
      margin-left: auto;
      color: #6b7280;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #64748b;
    }

    .empty-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    @media (max-width: 1024px) {
      .dashboard-sections {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .admin-dashboard-container {
        padding: 0.5rem;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
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
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;
  recentRequests: Demande[] = [];
  recentassignesRequest:Demande[]=[];
  allUsers: UserDTO[] = [];
  isLoading = true;
  
  // Dashboard stats
  totalUsers = 0;
  totalRequests = 0;
  pendingRequests = 0;
  satisfactionRate = 0;
  usersChangeThisMonth = 0;
  requestsChangeToday = 0;
  satisfactionChangeThisMonth = 0;
  
  // System status
  systemStatus: any = null;

  constructor(
    private requestService: RequestService,
    private authService: AuthService,
    private userService: UserService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Load dashboard stats
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.totalUsers = stats.totalUsers;
        this.totalRequests = stats.totalRequests;
        this.pendingRequests = stats.pendingRequests;
        this.satisfactionRate = stats.satisfactionRate;
        this.usersChangeThisMonth = stats.usersChangeThisMonth;
        this.requestsChangeToday = stats.requestsChangeToday;
        this.satisfactionChangeThisMonth = stats.satisfactionChangeThisMonth;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        // Fallback to individual service calls
        this.loadFallbackStats();
      }
    });

    // Load system status
    this.dashboardService.getSystemStatus().subscribe({
      next: (status) => {
        this.systemStatus = status;
      },
      error: (error) => {
        console.error('Error loading system status:', error);
        this.systemStatus = {
          server: 'online',
          database: 'online',
          storage: { status: 'warning', usagePercentage: 75 },
          api: 'online'
        };
      }
    });

    // Load recent requests
    this.requestService.getRecentRequests(5).subscribe({
      next: (requests) => {
        this.recentRequests = requests;
      },
      error: (error) => {
        console.error('Error loading recent requests:', error);
        this.recentRequests = [];
      }
    });

    this.requestService.getAssignedRequests(5).subscribe({
      next: (requests) => {
        this.recentassignesRequest = requests;
      },
      error: (error) => {
        console.error('Error loading recent assignées requests:', error);
        this.recentRequests = [];
      }

    });

    // Load all users for request user info
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.allUsers = [];
        this.isLoading = false;
      }
    });
  }

  loadFallbackStats(): void {
    // Fallback to individual service calls if dashboard stats fail
    this.userService.getUsersCount().subscribe({
      next: (count) => this.totalUsers = count,
      error: () => this.totalUsers = 0
    });

    this.requestService.getRequestsCount().subscribe({
      next: (count) => this.totalRequests = count,
      error: () => this.totalRequests = 0
    });

    this.requestService.getPendingRequestsCount().subscribe({
      next: (count) => this.pendingRequests = count,
      error: () => this.pendingRequests = 0
    });
  }

  getWelcomeMessage(): string {
    const hour = new Date().getHours();
    let greeting = 'Bonjour';
    if (hour >= 12 && hour < 17) greeting = 'Bon après-midi';
    else if (hour >= 17) greeting = 'Bonsoir';

    return `${greeting}, ${this.currentUser?.firstName || 'Administrateur'} ${this.currentUser?.lastName || ''}`;
  }

  getUserRoleMessage(): string {
    const roleLabel = this.getRoleLabel(this.currentUser?.role);
    return `Vue d'ensemble de la plateforme AOS MICEPP - Connecté en tant que ${roleLabel}`;
  }

  getRoleLabel(role?: string): string {
    const labels: Record<string, string> = {
      'ADMIN': 'Administrateur',
      'SUPPORT': 'Support',
      'AGENT': 'Agent'
    };
    return labels[role || ''] || role || 'Utilisateur';
  }

  getRequestUser(userId: string): UserDTO |undefined  {
    return this.allUsers.find(user => user.id === +userId);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'IN_PROGRESS': 'En cours',
      'APPROVED': 'Approuvée',
      'REJECTED': 'Rejetée',
      'COMPLETED': 'Terminée',
      'online': 'En ligne',
      'offline': 'Hors ligne',
      'warning': 'Attention'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  isAdmin(): boolean {
    console.log('isAdmin() called');
    console.log('Current user:', this.currentUser);
    if (!this.currentUser) {
      console.log('No current user, returning false');
      return false;
    }
    const userRole = this.currentUser.role;
    console.log('UserRole.ADMIN:', UserRole.ADMIN);
    const isAdminResult = userRole === UserRole.ADMIN;
    console.log('isAdmin result:', isAdminResult);
    return isAdminResult;
  }
}
