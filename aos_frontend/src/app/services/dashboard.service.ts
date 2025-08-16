import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface DashboardStats {
  totalUsers: number;
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  satisfactionRate: number;
  usersChangeThisMonth: number;
  requestsChangeToday: number;
  satisfactionChangeThisMonth: number;
  averageResolutionTime: number;
}

interface SystemStatus {
  server: 'online' | 'offline' | 'warning';
  database: 'online' | 'offline' | 'warning';
  storage: {
    status: 'online' | 'offline' | 'warning';
    usagePercentage: number;
  };
  api: 'online' | 'offline' | 'warning';
  lastUpdated: Date;
}

interface UserStats {
  processedRequests: number;
  averageResponseTime: number;
  completionRate: number;
  lastActivity: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `http://localhost:8089/AOS_MICEPP/admin/dashboard`;

  constructor(private http: HttpClient) {}

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  /**
   * Get system status
   */
  getSystemStatus(): Observable<SystemStatus> {
    return this.http.get<SystemStatus>(`${this.apiUrl}/system-status`);
  }

  /**
   * Refresh system status
   */
  refreshSystemStatus(): Observable<SystemStatus> {
    return this.http.post<SystemStatus>(`${this.apiUrl}/system-status/refresh`, {});
  }

  /**
   * Get user-specific statistics
   */
  getUserStats(userId: string): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/user-stats/${userId}`);
  }

  /**
   * Generate reports
   */
  generateReports(): Observable<{ reportUrl: string }> {
    return this.http.post<{ reportUrl: string }>(`${this.apiUrl}/reports/generate`, {});
  }
}