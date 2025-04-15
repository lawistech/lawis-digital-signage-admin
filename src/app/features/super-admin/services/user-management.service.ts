import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id: string | null;
  organization_name?: string;
  created_at: string;
  last_sign_in_at: string | null;
  subscription_tier?: string;
  subscription_status?: string;
  subscription_renewal_date?: string;
  screen_count?: number;
  max_screens?: number;
  storage_usage?: number;
  max_storage?: number;
  payment_status?: 'paid' | 'pending' | 'failed';
  last_active_screen?: string;
  organization_created_at?: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  role: string;
  organization_id?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  constructor(private supabase: SupabaseService) {}

  getUsers(page: number = 1, pageSize: number = 10): Observable<User[]> {
    const startRange = (page - 1) * pageSize;
    const endRange = page * pageSize - 1;

    return from(
      this.supabase.supabaseClient
        .from('profiles')
        .select(`
          *,
          organizations:organization_id (
            id,
            name,
            subscription_tier,
            subscription_status,
            max_screens,
            settings,
            created_at
          )
        `)
        .order('created_at', { ascending: false })
        .range(startRange, endRange)
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;

        return data.map(user => {
          // Get organization details if available
          const organization = user.organizations || {};
          const settings = organization.settings || {};

          // Calculate storage usage from settings if available
          const storageUsage = settings.storage_usage || 0;
          const maxStorage = settings.max_storage || 5000; // Default 5GB

          // We'll get screen count separately in a future enhancement
          const screenCount = Math.floor(Math.random() * (organization.max_screens || 1)); // Simulate random screen count for demo

          // Simulate payment status for demo
          const paymentStatuses = ['paid', 'pending', 'failed'];
          const randomPaymentStatus = organization.subscription_status === 'active' ?
            paymentStatuses[Math.floor(Math.random() * 2)] : // For active, either paid or pending
            paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)]; // Random for others

          // Simulate renewal date for demo
          const today = new Date();
          const renewalDate = new Date(today);
          renewalDate.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1); // Random date in next 30 days

          // Simulate last active screen for demo
          const screenNames = ['Lobby Display', 'Conference Room', 'Reception', 'Cafeteria', 'Main Entrance'];
          const randomScreenName = screenNames[Math.floor(Math.random() * screenNames.length)];

          return {
            id: user.id,
            email: user.email,
            // Use name field if it exists, otherwise try full_name
            full_name: user.name || user.full_name || 'No Name',
            role: user.role || 'user',
            organization_id: user.organization_id,
            organization_name: organization.name || 'N/A',
            organization_created_at: organization.created_at,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at || user.created_at,
            // Add subscription and resource information
            subscription_tier: organization.subscription_tier || 'free',
            subscription_status: organization.subscription_status || 'inactive',
            subscription_renewal_date: renewalDate.toISOString(),
            screen_count: screenCount,
            max_screens: organization.max_screens || 1,
            storage_usage: storageUsage,
            max_storage: maxStorage,
            payment_status: randomPaymentStatus as 'paid' | 'pending' | 'failed',
            last_active_screen: randomScreenName
          };
        });
      }),
      catchError(error => {
        console.error('Error fetching users:', error);
        return throwError(() => new Error('Failed to load users. Please try again.'));
      })
    );
  }

  getOrganizations(): Observable<Organization[]> {
    return from(
      this.supabase.supabaseClient
        .from('organizations')
        .select('id, name')
        .order('name', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data;
      }),
      catchError(error => {
        console.error('Error fetching organizations:', error);
        return throwError(() => new Error('Failed to load organizations. Please try again.'));
      })
    );
  }

  createUser(userData: CreateUserRequest): Observable<User> {
    // First create the auth user
    return from(
      this.supabase.supabaseClient.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name,
          role: userData.role
        }
      })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;

        // Now update the profile with additional information
        return from(
          this.supabase.supabaseClient
            .from('profiles')
            .update({
              name: userData.full_name, // Use 'name' instead of 'full_name'
              role: userData.role,
              organization_id: userData.organization_id || null
            })
            .eq('id', data.user.id)
            .select()
            .single()
        );
      }),
      map(({ data, error }: any) => {
        if (error) throw error;
        return data;
      }),
      catchError(error => {
        console.error('Error creating user:', error);
        return throwError(() => new Error('Failed to create user. ' + error.message));
      })
    );
  }

  updateUser(userId: string, userData: Partial<User>): Observable<User> {
    // Create an update object with only the fields that exist in the profiles table
    const updateData: any = {};

    // Check if we have a name field to update
    if (userData.full_name !== undefined) {
      // Try with 'name' instead of 'full_name'
      updateData.name = userData.full_name;
    }

    // Add other fields
    if (userData.role !== undefined) {
      updateData.role = userData.role;
    }

    if (userData.organization_id !== undefined) {
      updateData.organization_id = userData.organization_id;
    }

    console.log('Updating user with data:', updateData);

    return from(
      this.supabase.supabaseClient
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;

        // Map the response back to our User interface
        const user: User = {
          id: data.id,
          email: data.email,
          // Map 'name' to 'full_name' in our interface
          full_name: data.name || data.full_name || 'No Name',
          role: data.role || 'user',
          organization_id: data.organization_id,
          created_at: data.created_at,
          last_sign_in_at: data.last_sign_in_at || data.created_at
        };

        return user;
      }),
      catchError(error => {
        console.error('Error updating user:', error);
        return throwError(() => new Error('Failed to update user. Please try again.'));
      })
    );
  }

  deleteUser(userId: string): Observable<void> {
    return from(
      this.supabase.supabaseClient.auth.admin.deleteUser(userId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
        return;
      }),
      catchError(error => {
        console.error('Error deleting user:', error);
        return throwError(() => new Error('Failed to delete user. Please try again.'));
      })
    );
  }

  getUserCount(): Observable<number> {
    return from(
      this.supabase.supabaseClient
        .from('profiles')
        .select('id', { count: 'exact', head: true })
    ).pipe(
      map(({ count, error }) => {
        if (error) throw error;
        return count || 0;
      }),
      catchError(error => {
        console.error('Error getting user count:', error);
        return throwError(() => new Error('Failed to get user count. Please try again.'));
      })
    );
  }
}
