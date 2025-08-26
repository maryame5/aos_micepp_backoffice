import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    console.log('AuthGuard canActivate called for route:', route.url);
    console.log('User authenticated:', this.authService.isAuthenticated());
    
    if (!this.authService.isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Vérifier si l'utilisateur doit changer son mot de passe
    // Ne pas rediriger si l'utilisateur est déjà sur la page de changement de mot de passe
    if (this.authService.mustChangePassword() && !route.url.some(segment => segment.path === 'change-password')) {
      console.log('User must change password, redirecting to change password page');
      this.router.navigate(['/auth/change-password']);
      return false;
    }

    const requiredRoles = route.data['roles'] as UserRole[];
    console.log('Required roles:', requiredRoles);
    console.log('Current user:', this.authService.getCurrentUser());
    console.log('Current user roles:', this.authService.getCurrentUser()?.role);

    if (requiredRoles && requiredRoles.length > 0 && !this.authService.hasAnyRole(requiredRoles)) {
      console.log('User does not have required role, redirecting to unauthorized');
      this.router.navigate(['/unauthorized']);
      return false;
    }

    console.log('AuthGuard allowing access');
    return true;
  }
}