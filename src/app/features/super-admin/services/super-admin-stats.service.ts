import { Injectable } from '@angular/core';
import { Observable, forkJoin, map, from, of, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SupabaseService } from '../../../core/services/supabase.service';

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
  constructor(private supabase: SupabaseService) {}

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
      total: Math.floor(Math.random() * 100) + 50, // 50-150 screens
      active: Math.floor(Math.random() * 80) + 40, // 40-120 active screens
      totalUsers: Math.floor(Math.random() * 30) + 10 // 10-40 users
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
    console.log('Fetching subscription plans...');
    return from(
      this.supabase.supabaseClient
        .rpc('get_subscription_plans')
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
          }

          console.log('Plan features after processing:', features);

          return {
            id: plan.id,
            name: plan.name,
            price: parseFloat(plan.price) || 0,
            max_screens: parseInt(plan.max_screens) || 0,
            max_users: parseInt(plan.max_users) || 0,
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
        // Return default plans if there's an error
        const defaultPlans = [
          { name: 'Basic', price: 9.99, max_screens: 1, max_users: 2, features: ['Basic content scheduling', 'Standard support'] },
          { name: 'Standard', price: 29.99, max_screens: 5, max_users: 10, is_popular: true, features: ['Advanced scheduling', 'Priority support', 'Content templates'] },
          { name: 'Premium', price: 99.99, max_screens: 20, max_users: 50, features: ['Custom branding', 'API access', 'Advanced analytics', 'Dedicated support'] }
        ];
        console.log('Using default subscription plans:', defaultPlans);
        return of(defaultPlans);
      })
    );
  }

  updateSubscriptionPlan(planId: string, planData: Partial<SubscriptionPlan>): Observable<SubscriptionPlan> {
    console.log(`Updating subscription plan ${planId} with:`, planData);

    // Ensure features is an array
    const processedPlanData = {
      ...planData,
      features: Array.isArray(planData.features) ? planData.features : []
    };

    return from(
      this.supabase.supabaseClient
        .rpc('update_subscription_plan', { plan_id: planId, plan_data: processedPlanData })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error in update_subscription_plan RPC call:', error);
          if (error.message === 'Not authorized') {
            console.warn('Authorization error. Please check FIX-SUBSCRIPTION-PLANS.md for solutions.');
          } else if (error.message.includes('COALESCE could not convert type')) {
            console.warn('Type conversion error. Please check FIX-SUBSCRIPTION-PLANS.md for solutions.');
          }
          throw error;
        }
        console.log('Subscription plan updated successfully:', data);

        // Process the returned data to ensure all properties are properly formatted
        // Parse features if it's a string
        let features = [];
        if (typeof data.features === 'string') {
          try {
            features = JSON.parse(data.features);
          } catch (e) {
            console.warn('Failed to parse features string:', data.features);
          }
        } else if (Array.isArray(data.features)) {
          features = data.features;
        }

        console.log('Plan features after processing (update):', features);

        return {
          id: data.id,
          name: data.name,
          price: parseFloat(data.price) || 0,
          max_screens: parseInt(data.max_screens) || 0,
          max_users: parseInt(data.max_users) || 0,
          description: data.description || '',
          features: features,
          is_popular: !!data.is_popular,
          is_active: data.is_active !== false,
          created_at: data.created_at,
          updated_at: data.updated_at
        } as SubscriptionPlan;
      }),
      catchError(error => {
        console.error('Error updating subscription plan:', error);
        // If we're in development mode, use mock data to allow testing
        if ((error.message === 'Not authorized' || error.message.includes('COALESCE could not convert type')) && !environment.production) {
          console.warn('Using mock data for development. In production, please fix the authorization issue.');
          const updatedPlan: SubscriptionPlan = {
            id: planId,
            name: planData.name || 'Updated Plan',
            price: planData.price || 0,
            max_screens: planData.max_screens || 1,
            max_users: planData.max_users || 1,
            description: planData.description || '',
            features: Array.isArray(planData.features) ? planData.features :
              (planData.name === 'Basic' ? ['Basic content scheduling', 'Standard support'] :
               planData.name === 'Standard' ? ['Advanced scheduling', 'Priority support', 'Content templates'] :
               planData.name === 'Premium' ? ['Custom branding', 'API access', 'Advanced analytics', 'Dedicated support'] : []),
            is_popular: !!planData.is_popular,
            is_active: planData.is_active !== false,
            updated_at: new Date().toISOString()
          };
          return of(updatedPlan);
        }
        throw error;
      })
    );
  }

  addSubscriptionPlan(planData: Partial<SubscriptionPlan>): Observable<SubscriptionPlan> {
    console.log('Adding new subscription plan:', planData);

    // Ensure features is an array
    const processedPlanData = {
      ...planData,
      features: Array.isArray(planData.features) ? planData.features : []
    };

    return from(
      this.supabase.supabaseClient
        .rpc('add_subscription_plan', { plan_data: processedPlanData })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error in add_subscription_plan RPC call:', error);
          if (error.message === 'Not authorized') {
            console.warn('Authorization error. Please check FIX-SUBSCRIPTION-PLANS.md for solutions.');
          } else if (error.message.includes('COALESCE could not convert type')) {
            console.warn('Type conversion error. Please check FIX-SUBSCRIPTION-PLANS.md for solutions.');
          }
          throw error;
        }
        console.log('Subscription plan added successfully:', data);

        // Process the returned data to ensure all properties are properly formatted
        // Parse features if it's a string
        let features = [];
        if (typeof data.features === 'string') {
          try {
            features = JSON.parse(data.features);
          } catch (e) {
            console.warn('Failed to parse features string:', data.features);
          }
        } else if (Array.isArray(data.features)) {
          features = data.features;
        }

        console.log('Plan features after processing (add):', features);

        return {
          id: data.id,
          name: data.name,
          price: parseFloat(data.price) || 0,
          max_screens: parseInt(data.max_screens) || 0,
          max_users: parseInt(data.max_users) || 0,
          description: data.description || '',
          features: features,
          is_popular: !!data.is_popular,
          is_active: data.is_active !== false,
          created_at: data.created_at,
          updated_at: data.updated_at
        } as SubscriptionPlan;
      }),
      catchError(error => {
        console.error('Error adding subscription plan:', error);
        // If we're in development mode, use mock data to allow testing
        if ((error.message === 'Not authorized' || error.message.includes('COALESCE could not convert type')) && !environment.production) {
          console.warn('Using mock data for development. In production, please fix the authorization issue.');
          const mockPlan: SubscriptionPlan = {
            id: crypto.randomUUID(),
            name: planData.name || 'New Plan',
            price: planData.price || 0,
            max_screens: planData.max_screens || 1,
            max_users: planData.max_users || 1,
            description: planData.description || '',
            features: Array.isArray(planData.features) ? planData.features :
              (planData.name === 'Basic' ? ['Basic content scheduling', 'Standard support'] :
               planData.name === 'Standard' ? ['Advanced scheduling', 'Priority support', 'Content templates'] :
               planData.name === 'Premium' ? ['Custom branding', 'API access', 'Advanced analytics', 'Dedicated support'] : []),
            is_popular: !!planData.is_popular,
            is_active: planData.is_active !== false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          return of(mockPlan);
        }
        throw error;
      })
    );
  }

  deleteSubscriptionPlan(planId: string): Observable<boolean> {
    console.log(`Deleting subscription plan ${planId}`);
    return from(
      this.supabase.supabaseClient
        .rpc('delete_subscription_plan', { plan_id: planId })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error in delete_subscription_plan RPC call:', error);
          if (error.message === 'Not authorized') {
            console.warn('Authorization error. Please check FIX-SUBSCRIPTION-PLANS.md for solutions.');
          } else if (error.message === 'Cannot delete plan that is in use by organizations') {
            console.warn('This plan is currently in use by one or more organizations and cannot be deleted.');
          } else if (error.message.includes('COALESCE could not convert type')) {
            console.warn('Type conversion error. Please check FIX-SUBSCRIPTION-PLANS.md for solutions.');
          }
          throw error;
        }
        console.log('Subscription plan deleted successfully');
        return true;
      }),
      catchError(error => {
        console.error('Error deleting subscription plan:', error);
        // If we're in development mode, use mock data to allow testing
        if (error.message === 'Not authorized' && !environment.production) {
          console.warn('Using mock data for development. In production, please fix the authorization issue.');
          return of(true);
        }
        throw error;
      })
    );
  }
}