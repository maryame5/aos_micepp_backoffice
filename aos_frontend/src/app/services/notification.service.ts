import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
  userId: string;
  actionUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `http://localhost:8089/AOS_MICEPP/notifications`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get user notifications
   */
  getUserNotifications(limit?: number): Observable<Notification[]> {
    const params = limit ? { limit: limit.toString() } : {};
    return this.http.get<Notification[]>(`${this.apiUrl}/user`);
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unread-count`);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${notificationId}/read`, {});
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/mark-all-read`, {});
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${notificationId}`);
  }
}