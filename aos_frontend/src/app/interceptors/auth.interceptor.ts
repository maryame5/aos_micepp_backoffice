import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  console.log('AuthInterceptor - URL:', req.url);
  console.log('AuthInterceptor - Token:', token ? 'Present' : 'Missing');
  
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('AuthInterceptor - Adding Authorization header');
    return next(authReq);
  }
  
  console.log('AuthInterceptor - No token found, proceeding without auth');
  return next(req);
};