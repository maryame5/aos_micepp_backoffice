import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, delay } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse, UserRole, ChangePasswordRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly TOKEN_KEY = 'aos_token';
  private readonly USER_KEY = 'aos_user';

  // Mock users for development
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@aos.com',
      firstName: 'Ahmed',
      lastName: 'Ben Ali',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      department: 'Administration'
    },
    {
      id: '2',
      email: 'support@aos.com',
      firstName: 'Fatima',
      lastName: 'Zahra',
      role: UserRole.SUPPORT,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      department: 'Support'
    },
    {
      id: '3',
      email: 'agent@aos.com',
      firstName: 'Mohamed',
      lastName: 'Kassimi',
      role: UserRole.AGENT,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      department: 'Ressources Humaines'
    }
  ];

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Mock authentication - replace with real API call
    const user = this.mockUsers.find(u => u.email === credentials.email);
    
    if (user && credentials.password === 'password123') {
      const token = this.generateMockToken();
      const response: LoginResponse = {
        token,
        user,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };

      return of(response).pipe(
        delay(1000), // Simulate API delay
        tap(res => {
          localStorage.setItem(this.TOKEN_KEY, res.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        })
      );
    }

    throw new Error('Invalid credentials');
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  changePassword(request: ChangePasswordRequest): Observable<boolean> {
    // Mock password change - replace with real API call
    return of(true).pipe(delay(1000));
  }

  resetPassword(email: string): Observable<boolean> {
    // Mock password reset - replace with real API call
    return of(true).pipe(delay(1000));
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token && !this.isTokenExpired(token);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);

    if (token && userStr && !this.isTokenExpired(token)) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user from storage:', error);
        this.logout();
      }
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private generateMockToken(): string {
    const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'HS256' }));
    const payload = btoa(JSON.stringify({ 
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      iat: Math.floor(Date.now() / 1000)
    }));
    return `${header}.${payload}.mock-signature`;
  }
}