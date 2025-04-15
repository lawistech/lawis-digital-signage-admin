import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

export interface UserFilters {
  role?: string;
  status?: string;
  tier?: string;
  searchTerm?: string;
  dateFilter?: string;
}

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

  getUsers(page: number = 1, pageSize: number = 10, filters?: UserFilters): Observable<User[]> {
    const startRange = (page - 1) * pageSize;
    const endRange = page * pageSize - 1;

    // Start building the query
    let queryBuilder = this.supabase.supabaseClient
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
      `);

    // Apply filters if provided
    if (filters) {
      // Filter by role
      if (filters.role) {
        queryBuilder = queryBuilder.eq('role', filters.role);
      }

      // Filter by search term (email or name)
      if (filters.searchTerm) {
        queryBuilder = queryBuilder.or(`email.ilike.%${filters.searchTerm}%,name.ilike.%${filters.searchTerm}%`);
      }

      // Date filters
      if (filters.dateFilter) {
        const now = new Date();
        let dateLimit: Date;

        switch (filters.dateFilter) {
          case 'today':
            dateLimit = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            dateLimit = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            dateLimit = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'year':
            dateLimit = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
          default:
            dateLimit = new Date(0); // Beginning of time
        }

        queryBuilder = queryBuilder.gte('created_at', dateLimit.toISOString());
      }
    }

    // Apply ordering and pagination
    queryBuilder = queryBuilder.order('created_at', { ascending: false }).range(startRange, endRange);

    return from(queryBuilder).pipe(
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
    const profileUpdateData: any = {};
    // Create an update object for organization settings if needed
    const organizationUpdateData: any = {};
    let organizationId: string | null = null;

    // Check if we have a name field to update
    if (userData.full_name !== undefined) {
      // Try with 'name' instead of 'full_name'
      profileUpdateData.name = userData.full_name;
    }

    // Add other profile fields
    if (userData.role !== undefined) {
      profileUpdateData.role = userData.role;
    }

    if (userData.organization_id !== undefined) {
      profileUpdateData.organization_id = userData.organization_id;
      organizationId = userData.organization_id;
    }

    // Add subscription fields to organization update if they exist
    if (userData.subscription_tier !== undefined) {
      organizationUpdateData.subscription_tier = userData.subscription_tier;
    }

    if (userData.subscription_status !== undefined) {
      organizationUpdateData.subscription_status = userData.subscription_status;
    }

    if (userData.max_screens !== undefined) {
      organizationUpdateData.max_screens = userData.max_screens;
    }

    if (userData.max_storage !== undefined) {
      // Update settings object with max_storage
      organizationUpdateData.settings = { max_storage: userData.max_storage };
    }

    console.log('Updating user with data:', profileUpdateData);
    if (Object.keys(organizationUpdateData).length > 0) {
      console.log('Updating organization with data:', organizationUpdateData);
    }

    // First update the profile
    return from(
      this.supabase.supabaseClient
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', userId)
        .select()
        .single()
    ).pipe(
      // Then update the organization if needed
      map(({ data, error }) => {
        if (error) throw error;

        // If we have organization updates and an organization ID, update the organization
        if (Object.keys(organizationUpdateData).length > 0 && organizationId) {
          return from(
            this.supabase.supabaseClient
              .from('organizations')
              .update(organizationUpdateData)
              .eq('id', organizationId)
              .select()
          ).pipe(
            map(orgResult => {
              if (orgResult.error) throw orgResult.error;
              return data; // Return the profile data
            })
          );
        }

        // Otherwise just return the profile data
        return of(data);
      }),
      // Flatten the observable
      switchMap(result => result),
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

  getUserCount(filters?: UserFilters): Observable<number> {
    // Build the query with filters
    let queryBuilder = this.supabase.supabaseClient
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    // Apply filters if provided
    if (filters) {
      // Filter by role
      if (filters.role) {
        queryBuilder = queryBuilder.eq('role', filters.role);
      }

      // Filter by search term (email or name)
      if (filters.searchTerm) {
        queryBuilder = queryBuilder.or(`email.ilike.%${filters.searchTerm}%,name.ilike.%${filters.searchTerm}%`);
      }

      // Date filters
      if (filters.dateFilter) {
        const now = new Date();
        let dateLimit: Date;

        switch (filters.dateFilter) {
          case 'today':
            dateLimit = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            dateLimit = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            dateLimit = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'year':
            dateLimit = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
          default:
            dateLimit = new Date(0); // Beginning of time
        }

        queryBuilder = queryBuilder.gte('created_at', dateLimit.toISOString());
      }
    }

    // Execute the query
    return from(queryBuilder).pipe(
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

  // Get all users (for export)
  getAllUsers(filters?: UserFilters): Observable<User[]> {
    // Start building the query
    let queryBuilder = this.supabase.supabaseClient
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
      `);

    // Apply filters if provided
    if (filters) {
      // Filter by role
      if (filters.role) {
        queryBuilder = queryBuilder.eq('role', filters.role);
      }

      // Filter by search term (email or name)
      if (filters.searchTerm) {
        queryBuilder = queryBuilder.or(`email.ilike.%${filters.searchTerm}%,name.ilike.%${filters.searchTerm}%`);
      }

      // Date filters
      if (filters.dateFilter) {
        const now = new Date();
        let dateLimit: Date;

        switch (filters.dateFilter) {
          case 'today':
            dateLimit = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            dateLimit = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            dateLimit = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'year':
            dateLimit = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
          default:
            dateLimit = new Date(0); // Beginning of time
        }

        queryBuilder = queryBuilder.gte('created_at', dateLimit.toISOString());
      }
    }

    // Apply ordering but no pagination for export (get all records)
    queryBuilder = queryBuilder.order('created_at', { ascending: false });

    return from(queryBuilder).pipe(
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
        console.error('Error fetching all users:', error);
        return throwError(() => new Error('Failed to export users. Please try again.'));
      })
    );
  }
}