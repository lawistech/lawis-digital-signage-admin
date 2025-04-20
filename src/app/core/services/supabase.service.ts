import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Observable, from, of, throwError, timer } from 'rxjs';
import { catchError, map, retryWhen, mergeMap, delay, take } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabaseUrl = environment.supabaseUrl;
  private supabaseKey = environment.supabaseKey;
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  get supabaseClient(): SupabaseClient {
    return this.supabase;
  }

  getCurrentUser(): Observable<User | null> {
    return this.createSupabaseObservable(() => this.supabase.auth.getUser()).pipe(
      map(({ data }) => data?.user || null),
      catchError((error) => {
        console.error('Error getting current user:', error);
        return of(null);
      })
    );
  }

  // Synchronous method to get current user from local storage
  /**
   * Helper method to create an observable with retry logic for Supabase auth operations
   * @param operation Function that returns a Promise from Supabase auth
   * @returns Observable with retry logic
   */
  createSupabaseObservable<T>(operation: () => Promise<T>): Observable<T> {
    return from(operation()).pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, i) => {
            // Only retry on NavigatorLockAcquireTimeoutError or similar lock errors
            const isLockError = error.name === 'NavigatorLockAcquireTimeoutError' ||
                               error.message?.includes('lock') ||
                               error.message?.includes('Lock');

            // Retry up to 3 times with increasing delay for lock errors
            if (isLockError && i < 3) {
              console.log(`Retrying Supabase operation after lock error (attempt ${i + 1})`);
              return timer(i * 500); // 0ms, 500ms, 1000ms
            }

            return throwError(() => error);
          })
        )
      )
    );
  }

  getCurrentUserSync(): User | null {
    try {
      // Try multiple possible storage keys
      let session;

      // First try the new format (v2)
      const supabaseSession = localStorage.getItem('sb-' + this.supabaseUrl.split('//')[1].split('.')[0] + '-auth-token');
      if (supabaseSession) {
        session = JSON.parse(supabaseSession);
        console.log('Found user in new Supabase session format');
        return session?.user || null;
      }

      // Then try the old format
      session = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
      if (session?.currentSession?.user) {
        console.log('Found user in old Supabase session format');
        return session.currentSession.user;
      }

      // We can't synchronously get the user from the auth object in newer Supabase versions
      // as it's now async only, so we'll have to rely on the localStorage methods above

      console.warn('No user found in any storage location');
      return null;
    } catch (error) {
      console.error('Error getting current user from session:', error);
      return null;
    }
  }
}
