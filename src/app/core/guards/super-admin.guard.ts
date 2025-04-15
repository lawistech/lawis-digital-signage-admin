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
        if (user && user.user_metadata?.['role'] === 'super_admin') {
          return true;
        }

        // Redirect to unauthorized page or dashboard
        return this.router.createUrlTree(['/unauthorized']);
      })
    );
  }
}
