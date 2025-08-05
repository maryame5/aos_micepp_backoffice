import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="header-title">{{ title }}</h1>
          <p class="header-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
        </div>
        <div class="header-actions" *ngIf="showActions">
          <ng-content select="[slot=actions]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-title {
      font-size: 1.875rem;
      font-weight: 600;
      margin: 0;
    }

    .header-subtitle {
      font-size: 1rem;
      margin: 0.5rem 0 0 0;
      opacity: 0.9;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    @media (max-width: 768px) {
      .page-header {
        padding: 1rem;
        margin-bottom: 1rem;
      }

      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .header-title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() showActions: boolean = true;
}