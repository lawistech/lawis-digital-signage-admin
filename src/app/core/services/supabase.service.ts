import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


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
    return from(this.supabase.auth.getUser()).pipe(
      map(({ data }) => data?.user || null),
      catchError(() => of(null))
    );
  }

  // Synchronous method to get current user from local storage
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
