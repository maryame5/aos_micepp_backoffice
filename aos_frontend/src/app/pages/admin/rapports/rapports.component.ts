import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogService } from '../../../services/log.service';
import { Log } from '../../../models/log.model';
import { AuthService } from '../../../services/auth.service';
import { UserRole } from '../../../models/user.model';

@Component({
  selector: 'app-rapports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-6">
      <h1 class="text-2xl font-bold mb-6">{{ isAdmin ? 'Rapports - Tous les Logs' : 'Mes Rapports' }}</h1>

      <div *ngIf="loading" class="text-center py-8">
        <p>Chargement des logs...</p>
      </div>

      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <div *ngIf="!loading && !error" class="bg-white shadow-md rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Détails</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let log of logs" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ log.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ log.userId }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ log.action }}</td>
              <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{{ log.details }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ log.timestamp | date:'medium' }}</td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="logs.length === 0" class="text-center py-8 text-gray-500">
          Aucun log trouvé.
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Custom styles for rapports component */
  `]
})
export class RapportsComponent implements OnInit {
  logs: Log[] = [];
  isAdmin = false;
  loading = true;
  error: string | null = null;

  constructor(
    private logService: LogService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole(UserRole.ADMIN);
    if (this.isAdmin) {
      this.loadAllLogs();
    } else {
      this.loadMyLogs();
    }
  }

  loadMyLogs(): void {
    this.logService.getMyLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading logs';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadAllLogs(): void {
    this.logService.getAllLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading all logs';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
