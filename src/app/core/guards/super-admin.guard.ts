import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        // Check if user exists and has super_admin role
        if (user) {
          // For development, we'll allow users without a role or with super_admin role
          // In production, you would only allow super_admin role
          const userRole = user.user_metadata?.['role'];
          if (!userRole) {
            console.log('User has no role defined, allowing access for development');
            return true;
          } else if (userRole === 'super_admin') {
            return true;
          } else {
            console.log('User does not have super_admin role');
            return this.router.createUrlTree(['/unauthorized']);
          }
        }

        // Redirect to unauthorized page or dashboard if no user
        return this.router.createUrlTree(['/unauthorized']);
      })
    );
  }
}
