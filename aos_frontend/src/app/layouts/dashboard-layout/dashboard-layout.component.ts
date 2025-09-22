import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/shared/header/header.component';
import { SidebarComponent } from '../../components/shared/sidebar/sidebar.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    HeaderComponent,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatDividerModule
],
  template: `
    <div class="dashboard-layout">
      <mat-sidenav-container class="sidenav-container">
        <!-- Sidebar -->
        <mat-sidenav
          #drawer
          class="sidenav"
          fixedInViewport
          [attr.role]="'navigation'"
          [mode]="'over'"
          [opened]="false">
          <div class="sidebar-content">
            <div class="sidebar-header">
              <h3 class="sidebar-title">Navigation</h3>
            </div>
            
            <mat-nav-list class="sidebar-nav">
              <!-- Dashboard -->
              <a mat-list-item routerLink="/admin/dashboard" routerLinkActive="active" class="sidebar-link">
                <mat-icon matListItemIcon>dashboard</mat-icon>
                <span matListItemTitle>Tableau de bord</span>
              </a>

              <!-- Users Management (Admin only) -->
              <a mat-list-item routerLink="/admin/users" routerLinkActive="active" class="sidebar-link" *ngIf="isAdmin()">
                <mat-icon matListItemIcon>people</mat-icon>
                <span matListItemTitle>Utilisateurs</span>
              </a>

              <!-- Requests -->
              <a mat-list-item routerLink="/admin/requests" routerLinkActive="active" class="sidebar-link" *ngIf="isAdmin()">
                <mat-icon matListItemIcon>assignment</mat-icon>
                <span matListItemTitle>Demandes</span>
              </a>

              <!-- Complaints -->
              <a mat-list-item routerLink="/admin/complaints" routerLinkActive="active" class="sidebar-link" *ngIf="isAdmin()">
                <mat-icon matListItemIcon>support_agent</mat-icon>
                <span matListItemTitle>Réclamations</span>
              </a>

              <!-- Requests -->
              <a mat-list-item routerLink="/admin/my-requests" routerLinkActive="active" class="sidebar-link" >
                <mat-icon matListItemIcon>assignment</mat-icon>
                <span matListItemTitle>Mes demandes</span>
              </a>

              <!-- Complaints -->
              <a mat-list-item routerLink="/admin/my-complaints" routerLinkActive="active" class="sidebar-link">
                <mat-icon matListItemIcon>support_agent</mat-icon>
                <span matListItemTitle>Mes réclamations</span>
              </a>

               <a mat-list-item routerLink="/admin/contact" routerLinkActive="active" class="sidebar-link" >
                <mat-icon matListItemIcon>message</mat-icon>
                <span matListItemTitle>Messages de contact</span>
              </a>


              <mat-divider></mat-divider>

              <!-- Services Management (Admin only) -->
              <a mat-list-item routerLink="/admin/services" routerLinkActive="active" class="sidebar-link" *ngIf="isAdmin()">
                <mat-icon matListItemIcon>business_center</mat-icon>
                <span matListItemTitle>Services</span>
              </a>

              <!-- News Management (Admin only) -->
              <a mat-list-item routerLink="/admin/news" routerLinkActive="active" class="sidebar-link" >
                <mat-icon matListItemIcon>article</mat-icon>
                <span matListItemTitle>Actualités</span>
              </a>

              <mat-divider></mat-divider>

              <!-- Reports -->
              <a mat-list-item routerLink="/admin/reports" routerLinkActive="active" class="sidebar-link">
                <mat-icon matListItemIcon>analytics</mat-icon>
                <span matListItemTitle>Rapports</span>
              </a>

              <!-- Settings -->
              <a mat-list-item routerLink="/admin/settings" routerLinkActive="active" class="sidebar-link">
                <mat-icon matListItemIcon>settings</mat-icon>
                <span matListItemTitle>Paramètres</span>
              </a>
            </mat-nav-list>
          </div>
        </mat-sidenav>

      
        <mat-sidenav-content>
         
          <app-header (toggleSidebar)="drawer.toggle()"></app-header>
          
          <main class="dashboard-main">
            <router-outlet></router-outlet>
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      min-height: 100vh;
      background-color: #f8fafc;
    }

    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 250px;
    }

    .sidebar-content {
      padding: 0;
    }

    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .sidebar-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
    }

    .sidebar-nav {
      padding: 0;
    }

    .sidebar-link {
      color: #64748b;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .sidebar-link:hover {
      background: #f1f5f9;
      color: #3b82f6;
    }

    .sidebar-link.active {
      background: #dbeafe;
      color: #3b82f6;
      border-right: 3px solid #3b82f6;
    }

    .sidebar-link mat-icon {
      color: inherit;
    }

    .dashboard-main {
      min-height: calc(100vh - 64px);
      padding: 1rem;
    }

    @media (max-width: 768px) {
      .sidenav {
        width: 200px;
      }
      
      .dashboard-main {
        padding: 0.5rem;
      }
    }
  `]
})
export class DashboardLayoutComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  isAdmin(): boolean {
    if (!this.currentUser) return false;
    const userRole = this.currentUser.role;
    console.log('User Role:', userRole);
    console.log("userrole.admin", UserRole.ADMIN);
    return userRole == UserRole.ADMIN ;
  }
}