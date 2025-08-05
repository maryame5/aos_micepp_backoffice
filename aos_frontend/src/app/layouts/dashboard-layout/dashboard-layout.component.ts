import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet
  ],
  template: `
    <div class="dashboard-layout">
      <header class="dashboard-header">
        <div class="header-content">
          <div class="logo">
            <div class="logo-icon">🏢</div>
            <h1>AOS MICEPP</h1>
          </div>
          <nav class="header-nav">
            <a href="/" class="nav-link">Accueil</a>
            <a href="/services" class="nav-link">Services</a>
            <a href="/contact" class="nav-link">Contact</a>
          </nav>
        </div>
      </header>
      
      <main class="dashboard-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      min-height: 100vh;
      background-color: #f8fafc;
    }

    .dashboard-header {
      background: white;
      padding: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logo-icon {
      font-size: 2rem;
    }

    .logo h1 {
      color: #3b82f6;
      margin: 0;
      font-size: 1.5rem;
    }

    .header-nav {
      display: flex;
      gap: 1rem;
    }

    .nav-link {
      color: #64748b;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      transition: all 0.3s ease;
    }

    .nav-link:hover {
      color: #3b82f6;
      background: #f1f5f9;
    }

    .dashboard-main {
      min-height: calc(100vh - 80px);
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
      }

      .header-nav {
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  `]
})
export class DashboardLayoutComponent {}