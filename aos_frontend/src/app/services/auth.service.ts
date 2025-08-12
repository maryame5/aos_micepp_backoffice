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
        token: response.token,
        userType: response.userType as UserRole,
        email: response.email,
        mustChangePassword: response.mustChangePassword
      }) as LoginResponse),
      tap((response: LoginResponse) => {
        const user: User = {
          id: response.id,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          role: response.userType,

          createdAt: new Date(), // Current timestamp
          updatedAt: new Date(), // Current timestamp
          department: 'N/A' // Default value
          ,
          isActive: false
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
    return JSON.parse(localStorage.getItem(this.MUST_CHANGE_PASSWORD_KEY) || 'false');
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

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.status === 401) {
      errorMessage = 'Invalid credentials';
    } else if (error.status === 400) {
      errorMessage = typeof error.error === 'string' ? error.error : 'Bad request';
    }
    return throwError(() => new Error(errorMessage));
  }
}