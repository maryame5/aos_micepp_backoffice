import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse, UserRole, ChangePasswordRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly TOKEN_KEY = 'aos_token';
  private readonly USER_KEY = 'aos_user';
  private readonly MUST_CHANGE_PASSWORD_KEY = 'mustChangePassword';
  private readonly API_URL =  'http://localhost:8089/AOS_MICEPP/auth';

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<any>(`${this.API_URL}/login`, credentials).pipe(
      map(response => ({
        id:response.userId,
        token: response.token,
        userType: response.userType as UserRole,
        email: response.email ,
        mustChangePassword: response.mustChangePassword,
        firstName: response.FirstName,
        lastName: response.LastName,
        phoneNumber: response.phoneNumber,
        department: response.department,
        isActive: response.isActive
      }) as LoginResponse),
      tap((response: LoginResponse) => {
        const user: User = {
          id: response.id,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          role: response.userType,
          createdAt: new Date(), // Current timestamp
          phoneNumber: response.phoneNumber ?? '',
          updatedAt: new Date(),
          isActive: response.isActive ?? true,
          department: response.department ?? ''
        };
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        localStorage.setItem(this.MUST_CHANGE_PASSWORD_KEY, JSON.stringify(response.mustChangePassword));
        this.currentUserSubject.next(user);
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.MUST_CHANGE_PASSWORD_KEY);
    this.currentUserSubject.next(null);
  }

  changePassword(request: ChangePasswordRequest): Observable<boolean> {
    const token = this.getToken();
    console.log("Token:", token);
    if (!token) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.post<boolean>(`${this.API_URL}/change-password`, request, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).pipe(
      tap(success => {
        if (success) {
          localStorage.setItem(this.MUST_CHANGE_PASSWORD_KEY, JSON.stringify(false));
          console.log('Password changed successfully, mustChangePassword set to false');
        }
      }),
      catchError(this.handleError)
    );
  }

  resetPassword(email: string): Observable<string> {
    return new Observable(observer => {
      observer.next('Please contact the administration to reset your password.');
      observer.complete();
    });
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token && !this.isTokenExpired(token);
  }

  mustChangePassword(): boolean {
    try {
      return JSON.parse(localStorage.getItem(this.MUST_CHANGE_PASSWORD_KEY) || 'false');
    } catch (error) {
      console.error('Error parsing mustChangePassword from localStorage:', error);
      return false;
    }
  }

  getCurrentUser(): User | null {
    console.log(this.currentUserSubject);
    return this.currentUserSubject.value;
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Remove ROLE_ prefix from user role for comparison
    const userRole = user.role.replace('ROLE_', '');
    const cleanRole = role.replace('ROLE_', '');
    return userRole === cleanRole;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // If no roles are required, allow access
    if (!roles || roles.length === 0) return true;
    
    // Remove ROLE_ prefix from user role for comparison
    const userRole = user.role.replace('ROLE_', '');
    
    // Check if any of the required roles match (with or without ROLE_ prefix)
    return roles.some(role => {
      const cleanRole = role.replace('ROLE_', '');
      return userRole === cleanRole;
    });
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);

    if (token && userStr && !this.isTokenExpired(token)) {
      try {
        const user: User = JSON.parse(userStr);
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

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An error occurred';
    if (error.status === 401) {
     if (error.error?.error === 'TOKEN_EXPIRED') {
      errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      this.logout();
    } else {
      errorMessage = 'Invalid credentials';
    }
  } else if (error.status === 400) {
    errorMessage = typeof error.error === 'string' ? error.error : 'Bad request';
  }
    return throwError(() => new Error(errorMessage));
  }
}