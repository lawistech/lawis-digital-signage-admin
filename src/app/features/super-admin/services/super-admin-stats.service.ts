import { Injectable } from '@angular/core';
import { Observable, forkJoin, map, from, of, catchError } from 'rxjs';
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
    return from(
      this.supabase.supabaseClient
        .rpc('get_system_settings')
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as SystemSettings;
      }),
      catchError(error => {
        console.error('Error getting system settings:', error);
        return of({
          system_name: 'Digital Signage Platform',
          support_email: 'support@example.com',
          timezone: 'Europe/London',
          maintenance_mode: false
        });
      })
    );
  }

  updateSystemSettings(settings: Partial<SystemSettings>): Observable<SystemSettings> {
    return from(
      this.supabase.supabaseClient
        .rpc('update_system_settings', { settings })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as SystemSettings;
      }),
      catchError(error => {
        console.error('Error updating system settings:', error);
        throw error;
      })
    );
  }

  private getScreensStats() {
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
        return of({
          total: 0,
          active: 0,
          totalUsers: 0
        });
      })
    );
  }

  private getRevenueStats() {
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
        return of({
          monthly: 0
        });
      })
    );
  }
}