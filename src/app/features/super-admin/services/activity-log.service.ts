import { Injectable } from '@angular/core';
import { Observable, from, of, catchError, map } from 'rxjs';
import { SupabaseService } from '../../../core/services/supabase.service';

export interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class ActivityLogService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Get recent activity logs
   * @param limit Number of logs to retrieve
   * @returns Observable of activity logs
   */
  getRecentActivityLogs(limit: number = 10): Observable<ActivityLog[]> {
    // Try to use the RPC function first
    return from(
      this.supabase.supabaseClient
        .rpc('get_recent_activity_logs', { limit_count: limit })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as ActivityLog[];
      }),
      catchError(error => {
        console.log('RPC function get_recent_activity_logs not found, falling back to direct query');
        // Fall back to direct query if RPC function is not available
        return from(
          this.supabase.supabaseClient
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)
        ).pipe(
          map(({ data, error }) => {
            if (error) throw error;
            return data as ActivityLog[];
          }),
          catchError(error => {
            console.error('Error loading activity logs:', error);
            return of(this.createMockActivityLogs(limit));
          })
        );
      })
    );
  }

  /**
   * Get all activity logs with pagination
   * @param page Page number
   * @param pageSize Number of logs per page
   * @returns Observable of activity logs and total count
   */
  getAllActivityLogs(
    page: number = 1,
    pageSize: number = 10
  ): Observable<{ logs: ActivityLog[]; total: number }> {
    // Try to use the RPC function first
    return from(
      this.supabase.supabaseClient
        .rpc('get_all_activity_logs', { page_number: page, page_size: pageSize })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return {
          logs: data.logs as ActivityLog[],
          total: data.total_count || 0,
        };
      }),
      catchError(error => {
        console.log('RPC function get_all_activity_logs not found, falling back to direct query');
        // Fall back to direct query if RPC function is not available
        const startRange = (page - 1) * pageSize;
        const endRange = startRange + pageSize - 1;

        return from(
          this.supabase.supabaseClient
            .from('activity_logs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(startRange, endRange)
        ).pipe(
          map(({ data, error, count }) => {
            if (error) throw error;
            return {
              logs: data as ActivityLog[],
              total: count || 0,
            };
          }),
          catchError(error => {
            console.error('Error loading activity logs:', error);
            const mockLogs = this.createMockActivityLogs(pageSize);
            return of({
              logs: mockLogs,
              total: 100, // Mock total count
            });
          })
        );
      })
    );
  }

  /**
   * Create a new activity log
   * @param log Activity log data
   * @returns Observable of the created activity log
   */
  createActivityLog(log: Omit<ActivityLog, 'id' | 'created_at'>): Observable<ActivityLog> {
    // Try to use the RPC function first
    return from(
      this.supabase.supabaseClient
        .rpc('create_activity_log', {
          user_id: log.user_id,
          user_email: log.user_email,
          action: log.action,
          entity_type: log.entity_type,
          entity_id: log.entity_id,
          details: log.details
        })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as ActivityLog;
      }),
      catchError(error => {
        console.log('RPC function create_activity_log not found, falling back to direct insert');
        // Fall back to direct insert if RPC function is not available
        return from(
          this.supabase.supabaseClient
            .from('activity_logs')
            .insert([log])
            .select()
            .single()
        ).pipe(
          map(({ data, error }) => {
            if (error) throw error;
            return data as ActivityLog;
          }),
          catchError(error => {
            console.error('Error creating activity log:', error);
            throw error;
          })
        );
      })
    );
  }

  /**
   * Create mock activity logs for demonstration
   * @param count Number of logs to create
   * @returns Array of mock activity logs
   */
  private createMockActivityLogs(count: number = 10): ActivityLog[] {
    const actions = ['create', 'update', 'delete', 'login', 'logout'];
    const entityTypes = ['user', 'screen', 'organization', 'content', 'schedule'];
    const mockLogs: ActivityLog[] = [];

    // Generate random activity logs
    for (let i = 0; i < count; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
      const date = new Date();
      date.setMinutes(date.getMinutes() - i * 30); // Space them out by 30 minutes

      mockLogs.push({
        id: `mock-${i}`,
        user_id: 'mock-user-id',
        user_email: 'admin@example.com',
        action: action,
        entity_type: entityType,
        entity_id: `${entityType}-${Math.floor(Math.random() * 100)}`,
        details: { mock: true },
        created_at: date.toISOString()
      });
    }

    return mockLogs;
  }
}
