import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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
          case 'ADMIN':
          case 'SUPPORT':
            this.router.navigate(['/admin']);
            break;
          case 'AGENT':
            this.router.navigate(['/agent']);
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