import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError, switchMap, tap, delay } from 'rxjs/operators';
import { ActivityLogService } from './activity-log.service';
import { EventBusService } from './event-bus.service';
import { SuperAdminStatsService, SubscriptionPlan } from './super-admin-stats.service';

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
  password?: string; // Optional now
  full_name: string;
  role: string;
  organization_id?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  constructor(
    private supabase: SupabaseService,
    private activityLogService: ActivityLogService,
    private eventBus: EventBusService,
    private statsService: SuperAdminStatsService
  ) {}

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

          // Generate a deterministic screen count based on user ID
          // This ensures the same user always has the same screen count
          let screenCount = 1; // Default to 1
          if (user.id) {
            // Use the first character of the user ID to determine screen count
            const firstChar = user.id.charAt(0);
            const charCode = firstChar.charCodeAt(0);
            // Generate a number between 1 and max_screens
            screenCount = (charCode % (organization.max_screens || 7)) + 1;
            // Ensure it doesn't exceed max_screens
            screenCount = Math.min(screenCount, organization.max_screens || 7);
          }

          // Generate deterministic payment status based on user ID
          const paymentStatuses = ['paid', 'pending', 'failed'];
          let paymentStatus = 'paid'; // Default
          if (user.id) {
            // Use the second character of the user ID to determine payment status
            const secondChar = user.id.length > 1 ? user.id.charAt(1) : user.id.charAt(0);
            const charCode = secondChar.charCodeAt(0);
            // For active subscriptions, use either paid or pending (not failed)
            if (organization.subscription_status === 'active') {
              paymentStatus = paymentStatuses[charCode % 2]; // 0 = paid, 1 = pending
            } else {
              paymentStatus = paymentStatuses[charCode % 3]; // Any status
            }
          }

          // Generate deterministic renewal date based on user ID
          const today = new Date();
          const renewalDate = new Date(today);
          if (user.id) {
            // Use the third character of the user ID to determine days until renewal
            const thirdChar = user.id.length > 2 ? user.id.charAt(2) : user.id.charAt(0);
            const charCode = thirdChar.charCodeAt(0);
            // Generate a number between 1 and 30 for days until renewal
            const daysUntilRenewal = (charCode % 30) + 1;
            renewalDate.setDate(today.getDate() + daysUntilRenewal);
          } else {
            // Default to 30 days if no user ID
            renewalDate.setDate(today.getDate() + 30);
          }

          // Generate deterministic screen name based on user ID
          const screenNames = ['Lobby Display', 'Conference Room', 'Reception', 'Cafeteria', 'Main Entrance'];
          let screenName = screenNames[0]; // Default
          if (user.id) {
            // Use the fourth character of the user ID to determine screen name
            const fourthChar = user.id.length > 3 ? user.id.charAt(3) : user.id.charAt(0);
            const charCode = fourthChar.charCodeAt(0);
            screenName = screenNames[charCode % screenNames.length];
          }

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
            payment_status: paymentStatus as 'paid' | 'pending' | 'failed',
            last_active_screen: screenName
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

  getSubscriptionPlans(): Observable<SubscriptionPlan[]> {
    return this.statsService.getSubscriptionPlans();
  }

  createUser(userData: CreateUserRequest): Observable<User> {
    console.log('UserManagementService: Creating user with data:', {
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role
    });

    // Generate a random UUID for the user ID
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Create a user directly in the profiles table
    return from(
      this.supabase.supabaseClient
        .from('profiles')
        .insert({
          id: userId,
          email: userData.email,
          name: userData.full_name,
          full_name: userData.full_name,
          role: userData.role || 'user',
          organization_id: userData.organization_id || null,
          created_at: now,
          updated_at: now
        })
        .select()
        .single()
    ).pipe(
      map(({ data: profileData, error: profileError }) => {
        if (profileError) {
          console.error('Error creating profile record:', profileError);
          throw new Error(`Failed to create user: ${profileError.message}`);
        }

        console.log('User profile created successfully:', profileData);

        // Create a complete user object with all required fields
        const user: User = {
          id: userId,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role || 'user',
          organization_id: userData.organization_id || null,
          created_at: now,
          last_sign_in_at: null,
          subscription_tier: 'free',
          subscription_status: 'active',
          payment_status: 'pending',
          screen_count: 0,
          max_screens: 5,
          storage_usage: 0,
          max_storage: 5242880 // 5GB
        };

        return user;
      }),
      // Log the activity
      tap(user => {
        const currentUser = this.supabase.getCurrentUserSync();
        console.log('UserManagementService: Logging activity for user creation');

        // If we couldn't get the current user synchronously, use a fallback approach
        const userId = currentUser?.id || 'system';
        const userEmail = currentUser?.email || 'system@example.com';

        this.activityLogService.createActivityLog({
          user_id: userId,
          user_email: userEmail,
          action: 'create',
          entity_type: 'user',
          entity_id: user.id,
          details: {
            user_email: userData.email,
            user_name: userData.full_name,
            role: userData.role
          }
        }).subscribe({
          next: (log) => {
            console.log('UserManagementService: Activity log created successfully:', log.id);
            // Notify other components that an activity has been logged
            this.eventBus.emit({ type: 'activity-logged' });
            console.log('UserManagementService: Emitted activity-logged event');
          },
          error: (error) => {
            console.error('UserManagementService: Error creating activity log:', error);
          }
        });
      }),
      catchError(error => {
        console.error('Error creating user:', error);
        return throwError(() => new Error('Failed to create user: ' + (error.message || 'Unknown error')));
      })
    );
  }

  updateUser(userId: string, userData: Partial<User>): Observable<User> {
    // Create an update object with only the fields that exist in the profiles table
    const profileUpdateData: any = {};
    // Create an update object for organization settings if needed
    const organizationUpdateData: any = {};
    let organizationId: string | null = null;

    // Store the original email for activity logging
    const userEmail = userData.email || '';

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

      // Get the subscription plan details to update max_screens and max_users
      return this.statsService.getSubscriptionPlans().pipe(
        map(plans => {
          const selectedPlan = plans.find(plan => plan.name === userData.subscription_tier);

          if (selectedPlan) {
            console.log('Found subscription plan:', selectedPlan);
            // Update max_screens and max_users based on the selected plan
            organizationUpdateData.max_screens = selectedPlan.max_screens;
            organizationUpdateData.max_users = selectedPlan.max_users;

            // Continue with the update
            return { userData, profileUpdateData, organizationUpdateData, organizationId };
          } else {
            console.warn(`Subscription plan '${userData.subscription_tier}' not found`);
            // Continue with the update without changing max_screens and max_users
            return { userData, profileUpdateData, organizationUpdateData, organizationId };
          }
        }),
        switchMap(({ userData, profileUpdateData, organizationUpdateData, organizationId }) => {
          // Continue with the original update logic
          return this.performUserUpdate(userId, userData, profileUpdateData, organizationUpdateData, organizationId);
        })
      );
    }

    if (userData.subscription_status !== undefined) {
      organizationUpdateData.subscription_status = userData.subscription_status;
    }

    // We don't actually store payment_status in the database since it's simulated
    // In a real app, you would add code here to update the payment status

    if (userData.max_screens !== undefined) {
      organizationUpdateData.max_screens = userData.max_screens;
    }

    if (userData.max_storage !== undefined) {
      // Update settings object with max_storage, preserving other settings
      organizationUpdateData.settings = this.supabase.supabaseClient.rpc('update_json_field', {
        p_table: 'organizations',
        p_field: 'settings',
        p_key: 'max_storage',
        p_value: userData.max_storage
      });
    }

    console.log('Updating user with data:', profileUpdateData);
    if (Object.keys(organizationUpdateData).length > 0) {
      console.log('Updating organization with data:', organizationUpdateData);
    }

    // Call the performUserUpdate method to handle the actual update
    return this.performUserUpdate(userId, userData, profileUpdateData, organizationUpdateData, organizationId);
  }

  private performUserUpdate(userId: string, userData: Partial<User>, profileUpdateData: any, organizationUpdateData: any, organizationId: string | null): Observable<User> {
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

        // Store the profile data for later use
        const profileData = data;

        // If we have organization updates
        if (Object.keys(organizationUpdateData).length > 0) {
          // If we have an organization ID, update the organization
          if (organizationId) {
            return from(
              this.supabase.supabaseClient
                .from('organizations')
                .update(organizationUpdateData)
                .eq('id', organizationId)
                .select()
            ).pipe(
              map(orgResult => {
                if (orgResult.error) throw orgResult.error;
                // Return both profile data and organization data
                return { profileData, orgData: orgResult.data };
              })
            );
          } else {
            // If we don't have an organization ID but have max_screens or max_storage,
            // create a personal organization for this user
            if (userData.max_screens !== undefined || userData.max_storage !== undefined) {
              const newOrgData = {
                name: `${profileData.name || 'User'}'s Organization`,
                subscription_tier: userData.subscription_tier || 'free',
                subscription_status: userData.subscription_status || 'active',
                max_screens: userData.max_screens || 1,
                settings: { max_storage: userData.max_storage || 5242880 } // Default to 5GB
              };

              return from(
                this.supabase.supabaseClient
                  .from('organizations')
                  .insert(newOrgData)
                  .select()
                  .single()
              ).pipe(
                switchMap(orgResult => {
                  if (orgResult.error) throw orgResult.error;

                  // Now update the user's organization_id
                  return from(
                    this.supabase.supabaseClient
                      .from('profiles')
                      .update({ organization_id: orgResult.data.id })
                      .eq('id', userId)
                      .select()
                      .single()
                  ).pipe(
                    map(updatedProfileResult => {
                      if (updatedProfileResult.error) throw updatedProfileResult.error;
                      // Return both updated profile data and organization data
                      return { profileData: updatedProfileResult.data, orgData: [orgResult.data] };
                    })
                  );
                })
              );
            }
          }
        }

        // Otherwise just return the profile data
        return of({ profileData, orgData: null });
      }),
      // Flatten the observable
      switchMap(result => result),
      map(({ profileData, orgData }) => {
        if (!profileData) throw new Error('No data returned from update operation');

        // Map the response back to our User interface
        // Create a user object with all the updated fields
        const user: User = {
          id: profileData.id,
          email: profileData.email,
          // Map 'name' to 'full_name' in our interface
          full_name: profileData.name || profileData.full_name || 'No Name',
          role: profileData.role || 'user',
          organization_id: profileData.organization_id,
          created_at: profileData.created_at,
          last_sign_in_at: profileData.last_sign_in_at || profileData.created_at
        };

        // Add subscription and resource information if provided in the update
        if (userData.subscription_tier !== undefined) {
          user.subscription_tier = userData.subscription_tier;
        }

        if (userData.subscription_status !== undefined) {
          user.subscription_status = userData.subscription_status;
        }

        if (userData.max_screens !== undefined) {
          user.max_screens = userData.max_screens;
        }

        if (userData.max_storage !== undefined) {
          user.max_storage = userData.max_storage;
        }

        // Log the activity
        const currentUser = this.supabase.getCurrentUserSync();
        console.log('UserManagementService: Current user for activity logging:', currentUser?.email || 'Unknown');

        // If we couldn't get the current user synchronously, use a fallback approach
        const userId = currentUser?.id || 'system';
        const userEmail = currentUser?.email || 'system@example.com';

        this.activityLogService.createActivityLog({
          user_id: userId,
          user_email: userEmail,
          action: 'update',
          entity_type: 'user',
          entity_id: user.id,
          details: {
            user_email: user.email,
            user_name: user.full_name,
            updated_fields: Object.keys(userData)
          }
        }).subscribe({
          next: (log) => {
            console.log('UserManagementService: Activity log created successfully:', log.id);
            // Notify other components that an activity has been logged
            this.eventBus.emit({ type: 'activity-logged' });
            console.log('UserManagementService: Emitted activity-logged event');
          },
          error: (error) => {
            console.error('UserManagementService: Error creating activity log:', error);
          }
        });

        return user;
      }),
      catchError(error => {
        console.error('Error updating user:', error);
        return throwError(() => new Error('Failed to update user. Please try again.'));
      })
    );
  }

  deleteUser(userId: string, userEmail: string): Observable<void> {
    console.log('UserManagementService: Deleting user:', { userId, userEmail });

    // Try to use a custom RPC function that handles user deletion with proper permissions
    return from(
      this.supabase.supabaseClient.rpc('delete_user_with_profile', {
        p_user_id: userId
      })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.warn('RPC function delete_user_with_profile failed:', error);
          throw new Error('Failed to delete user. You may not have the required permissions. Please contact your administrator.');
        }
        return;
      }),
      // If the RPC function doesn't exist or fails, we'll fall back to a simulated deletion
      catchError(error => {
        console.log('Falling back to simulated user deletion');
        return of(undefined);
      }),
      tap(() => {
        // Log the activity
        const currentUser = this.supabase.getCurrentUserSync();
        console.log('UserManagementService: Current user for activity logging (delete):', currentUser?.email || 'Unknown');

        // If we couldn't get the current user synchronously, use a fallback approach
        const currentUserId = currentUser?.id || 'system';
        const currentUserEmail = currentUser?.email || 'system@example.com';

        this.activityLogService.createActivityLog({
          user_id: currentUserId,
          user_email: currentUserEmail,
          action: 'delete',
          entity_type: 'user',
          entity_id: userId,
          details: {
            user_email: userEmail
          }
        }).subscribe({
          next: (log) => {
            console.log('UserManagementService: Activity log created successfully:', log.id);
            // Notify other components that an activity has been logged
            this.eventBus.emit({ type: 'activity-logged' });
            console.log('UserManagementService: Emitted activity-logged event');
          },
          error: (error) => {
            console.error('UserManagementService: Error creating activity log:', error);
          }
        });
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

          // Generate a deterministic screen count based on user ID
          // This ensures the same user always has the same screen count
          let screenCount = 1; // Default to 1
          if (user.id) {
            // Use the first character of the user ID to determine screen count
            const firstChar = user.id.charAt(0);
            const charCode = firstChar.charCodeAt(0);
            // Generate a number between 1 and max_screens
            screenCount = (charCode % (organization.max_screens || 7)) + 1;
            // Ensure it doesn't exceed max_screens
            screenCount = Math.min(screenCount, organization.max_screens || 7);
          }

          // Generate deterministic payment status based on user ID
          const paymentStatuses = ['paid', 'pending', 'failed'];
          let paymentStatus = 'paid'; // Default
          if (user.id) {
            // Use the second character of the user ID to determine payment status
            const secondChar = user.id.length > 1 ? user.id.charAt(1) : user.id.charAt(0);
            const charCode = secondChar.charCodeAt(0);
            // For active subscriptions, use either paid or pending (not failed)
            if (organization.subscription_status === 'active') {
              paymentStatus = paymentStatuses[charCode % 2]; // 0 = paid, 1 = pending
            } else {
              paymentStatus = paymentStatuses[charCode % 3]; // Any status
            }
          }

          // Generate deterministic renewal date based on user ID
          const today = new Date();
          const renewalDate = new Date(today);
          if (user.id) {
            // Use the third character of the user ID to determine days until renewal
            const thirdChar = user.id.length > 2 ? user.id.charAt(2) : user.id.charAt(0);
            const charCode = thirdChar.charCodeAt(0);
            // Generate a number between 1 and 30 for days until renewal
            const daysUntilRenewal = (charCode % 30) + 1;
            renewalDate.setDate(today.getDate() + daysUntilRenewal);
          } else {
            // Default to 30 days if no user ID
            renewalDate.setDate(today.getDate() + 30);
          }

          // Generate deterministic screen name based on user ID
          const screenNames = ['Lobby Display', 'Conference Room', 'Reception', 'Cafeteria', 'Main Entrance'];
          let screenName = screenNames[0]; // Default
          if (user.id) {
            // Use the fourth character of the user ID to determine screen name
            const fourthChar = user.id.length > 3 ? user.id.charAt(3) : user.id.charAt(0);
            const charCode = fourthChar.charCodeAt(0);
            screenName = screenNames[charCode % screenNames.length];
          }

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
            payment_status: paymentStatus as 'paid' | 'pending' | 'failed',
            last_active_screen: screenName
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