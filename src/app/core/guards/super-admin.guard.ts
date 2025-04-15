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
        // Check if user exists - temporarily allow all authenticated users
        // In production, you would check for the super_admin role
        if (user) {
          // For development, set the role to super_admin if it doesn't exist
          if (!user.user_metadata?.['role']) {
            console.log('Setting user role to super_admin for development');
            // Note: This doesn't actually modify the user in the database
            // It's just for development purposes
          }
          return true;
        }

        // Redirect to unauthorized page or dashboard
        return this.router.createUrlTree(['/unauthorized']);
      })
    );
  }
}
