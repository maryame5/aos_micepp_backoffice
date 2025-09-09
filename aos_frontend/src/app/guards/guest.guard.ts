import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getCurrentUser();
      if (user) {
        switch (user.role) {
          case UserRole.ADMIN:
            this.router.navigate(['/admin']);
            break;
          case UserRole.SUPPORT:
            this.router.navigate(['/admin']);
            break;
          default:
            this.router.navigate(['/']);
        }
      }
      return false;
    }
    return true;
  }
}