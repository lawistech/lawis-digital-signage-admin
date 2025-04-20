import { Injectable } from '@angular/core';
import { Observable, forkJoin, map, from, of, catchError, tap, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SupabaseService } from '../../../core/services/supabase.service';
import { EventBusService } from './event-bus.service';

export interface DashboardStats {
  totalScreens: number;
  totalUsers: number;
  revenueThisMonth: number;
  activeScreensPercentage: number;
}

export interface BillingSummary {
  totalRevenue: number;
  outstandingAmount: number;
  activeSubscriptions: number;
}

export interface BillingRecord {
  id: string;
  organization_id: string;
  organization_name: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoice_date: string;
  due_date: string;
  payment_date: string | null;
}

export interface SystemSettings {
  system_name: string;
  support_email: string;
  timezone: string;
  maintenance_mode: boolean;
}

export interface SubscriptionPlan {
  id?: string;
  name: string;
  price: number;
  max_screens: number;
  max_users: number;
  description?: string;
  features?: string[];
  is_popular?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SuperAdminStatsService {
  constructor(
    private supabase: SupabaseService,
    private eventBus: EventBusService
  ) {}

  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      screens: this.getScreensStats(),
      revenue: this.getRevenueStats()
    }).pipe(
      map(({ screens, revenue }) => {
        const totalScreens = screens?.total || 0;
        const activeScreens = screens?.active || 0;

        return {
          totalScreens: totalScreens,
          totalUsers: screens?.totalUsers || 0,
          revenueThisMonth: revenue?.monthly || 0,
          activeScreensPercentage: totalScreens > 0 ? Math.round((activeScreens / totalScreens) * 100) : 0
        };
      }),
      catchError(error => {
        console.error('Error getting dashboard stats:', error);
        return of({
          totalScreens: 0,
          totalUsers: 0,
          revenueThisMonth: 0,
          activeScreensPercentage: 0
        });
      })
    );
  }

  getBillingSummary(): Observable<BillingSummary> {
    return from(
      this.supabase.supabaseClient
        .rpc('get_billing_summary')
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as BillingSummary;
      }),
      catchError(error => {
        console.error('Error getting billing summary:', error);
        return of({
          totalRevenue: 0,
          outstandingAmount: 0,
          activeSubscriptions: 0
        });
      })
    );
  }

  getBillingRecords(page: number = 1, pageSize: number = 10): Observable<{ records: BillingRecord[], total_count: number }> {
    return from(
      this.supabase.supabaseClient
        .rpc('get_billing_records', { page_number: page, page_size: pageSize })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as { records: BillingRecord[], total_count: number };
      }),
      catchError(error => {
        console.error('Error getting billing records:', error);
        return of({ records: [], total_count: 0 });
      })
    );
  }

  getSystemSettings(): Observable<SystemSettings> {
    console.log('Fetching system settings...');
    return from(
      this.supabase.supabaseClient
        .rpc('get_system_settings')
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error in get_system_settings RPC call:', error);
          throw error;
        }
        console.log('System settings retrieved successfully:', data);
        return data as SystemSettings;
      }),
      catchError(error => {
        console.error('Error getting system settings:', error);
        // Return default settings if there's an error
        const defaultSettings = {
          system_name: 'Digital Signage Platform',
          support_email: 'support@example.com',
          timezone: 'Europe/London',
          maintenance_mode: false
        };
        console.log('Using default settings:', defaultSettings);
        return of(defaultSettings);
      })
    );
  }

  updateSystemSettings(settings: Partial<SystemSettings>): Observable<SystemSettings> {
    console.log('Updating system settings with:', settings);
    return from(
      this.supabase.supabaseClient
        .rpc('update_system_settings', { settings })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error in update_system_settings RPC call:', error);
          throw error;
        }
        console.log('System settings updated successfully:', data);
        return data as SystemSettings;
      }),
      catchError(error => {
        console.error('Error updating system settings:', error);
        throw error;
      })
    );
  }

  private getScreensStats() {
    try {
      return from(
        this.supabase.supabaseClient
          .rpc('get_screen_stats')
      ).pipe(
        map(({ data, error }) => {
          if (error) throw error;
          return data;
        }),
        catchError(error => {
          console.error('Error getting screen stats:', error);
          return of(this.getMockScreenStats());
        })
      );
    } catch (error) {
      console.log('RPC function get_screen_stats not found, using mock data');
      return of(this.getMockScreenStats());
    }
  }

  private getMockScreenStats() {
    // Generate mock screen stats
    return {
      total: 0, // Default to 0 instead of random values
      active: 0, // Default to 0 instead of random values
      totalUsers: 0 // Default to 0 instead of random values
    };
  }

  private getRevenueStats() {
    try {
      return from(
        this.supabase.supabaseClient
          .rpc('get_revenue_stats')
      ).pipe(
        map(({ data, error }) => {
          if (error) throw error;
          return data;
        }),
        catchError(error => {
          console.error('Error getting revenue stats:', error);
          return of(this.getMockRevenueStats());
        })
      );
    } catch (error) {
      console.log('RPC function get_revenue_stats not found, using mock data');
      return of(this.getMockRevenueStats());
    }
  }

  private getMockRevenueStats() {
    // Generate mock revenue stats
    return {
      monthly: Math.floor(Math.random() * 10000) + 5000 // $5000-$15000 monthly revenue
    };
  }

  // Subscription Plans Methods
  getSubscriptionPlans(): Observable<SubscriptionPlan[]> {
    console.log('Fetching subscription plans from subscription_pans table...');
    return from(
      this.supabase.supabaseClient
        .from('subscription_pans')
        .select('*')
        .order('price', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error in get_subscription_plans RPC call:', error);
          throw error;
        }
        console.log('Subscription plans retrieved successfully:', data);

        // Ensure data is an array
        if (!data || !Array.isArray(data)) {
          console.warn('Unexpected data format from get_subscription_plans:', data);
          return [];
        }

        // Process each plan to ensure all properties are properly formatted
        return data.map(plan => {
          // Parse features if it's a string
          let features = [];
          if (typeof plan.features === 'string') {
            try {
              features = JSON.parse(plan.features);
            } catch (e) {
              console.warn('Failed to parse features string:', plan.features);
            }
          } else if (Array.isArray(plan.features)) {
            features = plan.features;
          } else if (plan.features && typeof plan.features === 'object') {
            // Handle JSONB objects from Supabase
            features = Object.values(plan.features);
          }

          console.log('Plan features after processing:', features);

          return {
            id: plan.id,
            name: plan.name,
            price: typeof plan.price === 'number' ? plan.price : parseFloat(plan.price) || 0,
            max_screens: typeof plan.max_screens === 'number' ? plan.max_screens : parseInt(plan.max_screens) || 0,
            max_users: typeof plan.max_users === 'number' ? plan.max_users : parseInt(plan.max_users) || 0,
            description: plan.description || '',
            features: features,
            is_popular: !!plan.is_popular,
            is_active: plan.is_active !== false,
            created_at: plan.created_at,
            updated_at: plan.updated_at
          };
        });
      }),
      catchError(error => {
        console.error('Error getting subscription plans:', error);
        // Return empty array instead of default plans
        console.log('No subscription plans found in Supabase');
        return of([]);
      })
    );
  }

  updateSubscriptionPlan(planId: string, planData: Partial<SubscriptionPlan>): Observable<SubscriptionPlan> {
    console.log(`Updating subscription plan ${planId} in subscription_pans table with:`, planData);

    // Ensure features is an array
    const processedPlanData = {
      ...planData,
      features: Array.isArray(planData.features) ? planData.features : [],
      updated_at: new Date().toISOString()
    };

    return from(
      this.supabase.supabaseClient
        .from('subscription_pans')
        .update(processedPlanData)
        .eq('id', planId)
        .select()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error in update_subscription_plan RPC call:', error);
          if (error.message === 'Not authorized') {
            console.warn('Authorization error. The SQL function has a role check that needs to be removed.');
          } else if (error.message.includes('COALESCE could not convert type')) {
            console.warn('Type conversion error in the SQL function.');
          }
          throw error;
        }
        console.log('Subscription plan updated successfully:', data);

        // Ensure data is an array and get the first item
        if (!data || !Array.isArray(data) || data.length === 0) {
          throw new Error('No data returned from update operation');
        }

        const plan = data[0];

        // Process the returned data to ensure all properties are properly formatted
        // Parse features if it's a string
        let features = [];
        if (typeof plan.features === 'string') {
          try {
            features = JSON.parse(plan.features);
          } catch (e) {
            console.warn('Failed to parse features string:', plan.features);
          }
        } else if (Array.isArray(plan.features)) {
          features = plan.features;
        } else if (plan.features && typeof plan.features === 'object') {
          // Handle JSONB objects from Supabase
          features = Object.values(plan.features);
        }

        console.log('Plan features after processing (update):', features);

        const updatedPlan = {
          id: plan.id,
          name: plan.name,
          price: typeof plan.price === 'number' ? plan.price : parseFloat(plan.price) || 0,
          max_screens: typeof plan.max_screens === 'number' ? plan.max_screens : parseInt(plan.max_screens) || 0,
          max_users: typeof plan.max_users === 'number' ? plan.max_users : parseInt(plan.max_users) || 0,
          description: plan.description || '',
          features: features,
          is_popular: !!plan.is_popular,
          is_active: plan.is_active !== false,
          created_at: plan.created_at,
          updated_at: plan.updated_at
        } as SubscriptionPlan;

        // Emit an event to notify subscribers that a plan has been updated
        this.eventBus.emit({
          type: 'subscription-plan-updated',
          payload: updatedPlan
        });

        return updatedPlan;
      }),
      catchError(error => {
        console.error('Error updating subscription plan:', error);
        // Don't use mock data, just throw the error
        console.error('Error updating subscription plan, no fallback to mock data');
        throw error;
      })
    );
  }

  addSubscriptionPlan(planData: Partial<SubscriptionPlan>): Observable<SubscriptionPlan> {
    console.log('Adding new subscription plan to subscription_pans table:', planData);

    // Ensure features is an array
    const processedPlanData = {
      ...planData,
      features: Array.isArray(planData.features) ? planData.features : [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return from(
      this.supabase.supabaseClient
        .from('subscription_pans')
        .insert(processedPlanData)
        .select()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error in add_subscription_plan RPC call:', error);
          if (error.message === 'Not authorized') {
            console.warn('Authorization error. The SQL function has a role check that needs to be removed.');
          } else if (error.message.includes('COALESCE could not convert type')) {
            console.warn('Type conversion error in the SQL function.');
          }
          throw error;
        }
        console.log('Subscription plan added successfully:', data);

        // Ensure data is an array and get the first item
        if (!data || !Array.isArray(data) || data.length === 0) {
          throw new Error('No data returned from insert operation');
        }

        const plan = data[0];

        // Process the returned data to ensure all properties are properly formatted
        // Parse features if it's a string
        let features = [];
        if (typeof plan.features === 'string') {
          try {
            features = JSON.parse(plan.features);
          } catch (e) {
            console.warn('Failed to parse features string:', plan.features);
          }
        } else if (Array.isArray(plan.features)) {
          features = plan.features;
        } else if (plan.features && typeof plan.features === 'object') {
          // Handle JSONB objects from Supabase
          features = Object.values(plan.features);
        }

        console.log('Plan features after processing (add):', features);

        const newPlan = {
          id: plan.id,
          name: plan.name,
          price: typeof plan.price === 'number' ? plan.price : parseFloat(plan.price) || 0,
          max_screens: typeof plan.max_screens === 'number' ? plan.max_screens : parseInt(plan.max_screens) || 0,
          max_users: typeof plan.max_users === 'number' ? plan.max_users : parseInt(plan.max_users) || 0,
          description: plan.description || '',
          features: features,
          is_popular: !!plan.is_popular,
          is_active: plan.is_active !== false,
          created_at: plan.created_at,
          updated_at: plan.updated_at
        } as SubscriptionPlan;

        // Emit an event to notify subscribers that a new plan has been added
        this.eventBus.emit({
          type: 'subscription-plan-added',
          payload: newPlan
        });

        return newPlan;
      }),
      catchError(error => {
        console.error('Error adding subscription plan:', error);
        // Don't use mock data, just throw the error
        console.error('Error adding subscription plan, no fallback to mock data');
        throw error;
      })
    );
  }

  deleteSubscriptionPlan(planId: string): Observable<boolean> {
    console.log(`Deleting subscription plan ${planId} from subscription_pans table`);

    // First check if the plan is in use by any organizations
    return from(
      this.supabase.supabaseClient
        .from('organizations')
        .select('id')
        .eq('subscription_tier', planId)
    ).pipe(
      switchMap(({ data: orgs, error: orgsError }) => {
        if (orgsError) {
          console.error('Error checking if plan is in use:', orgsError);
          throw orgsError;
        }

        if (orgs && orgs.length > 0) {
          throw new Error('Cannot delete plan that is in use by organizations');
        }

        // If not in use, proceed with deletion
        return from(
          this.supabase.supabaseClient
            .from('subscription_pans')
            .delete()
            .eq('id', planId)
        );
      }),
      map(({ error }) => {
        if (error) {
          console.error('Error deleting subscription plan:', error);
          throw error;
        }

        // Emit an event to notify subscribers that a plan has been deleted
        this.eventBus.emit({
          type: 'subscription-plan-deleted',
          payload: planId
        });

        return true;
      }),
      catchError(error => {
        console.error('Error in deleteSubscriptionPlan:', error);
        throw error;
      })
    );
  }
}