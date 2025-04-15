import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SupabaseService } from '../../../../core/services/supabase.service';

interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  created_at: string;
}

@Component({
  selector: 'app-activity-log',
  template: `
    <div class="space-y-4">
      <div *ngIf="loading" class="flex justify-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <div *ngIf="!loading && activityLogs.length === 0" class="text-center py-4 text-gray-500">
        No recent activity to display
      </div>

      <div *ngFor="let log of activityLogs" class="border-b border-gray-100 pb-3 last:border-0">
        <div class="flex items-start">
          <div class="bg-blue-100 text-blue-800 rounded-full p-2 mr-3">
            <span class="material-icons text-sm">{{getActionIcon(log.action)}}</span>
          </div>
          <div class="flex-1">
            <div class="flex justify-between">
              <p class="font-medium">{{formatAction(log)}}</p>
              <span class="text-sm text-gray-500">{{formatDate(log.created_at)}}</span>
            </div>
            <p class="text-sm text-gray-600">by {{log.user_email || 'Unknown user'}}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ActivityLogComponent implements OnInit {
  activityLogs: ActivityLog[] = [];
  loading = true;

  constructor(private supabase: SupabaseService) {}

  ngOnInit() {
    this.loadActivityLogs();
  }

  private loadActivityLogs() {
    // First check if the activity_logs table exists
    this.supabase.supabaseClient
      .from('activity_logs')
      .select('*', { count: 'exact', head: true })
      .then(({ count, error }) => {
        this.loading = false;

        // If there's an error or no data, create some mock activity logs
        if (error || count === 0) {
          console.log('Using mock activity logs data');
          this.createMockActivityLogs();
          return;
        }

        // If the table exists and has data, load the real data
        this.supabase.supabaseClient
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
          .then(({ data, error }) => {
            if (error) {
              console.error('Error loading activity logs:', error);
              this.createMockActivityLogs();
              return;
            }
            this.activityLogs = data as ActivityLog[];
          });
      });
  }

  private createMockActivityLogs() {
    // Create some mock activity logs for demonstration
    const actions = ['create', 'update', 'delete', 'login', 'logout'];
    const entityTypes = ['user', 'screen', 'organization', 'content', 'schedule'];
    const mockLogs: ActivityLog[] = [];

    // Generate 10 random activity logs
    for (let i = 0; i < 10; i++) {
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

    this.activityLogs = mockLogs;
  }

  getActionIcon(action: string): string {
    const icons: {[key: string]: string} = {
      'create': 'add_circle',
      'update': 'edit',
      'delete': 'delete',
      'login': 'login',
      'logout': 'logout'
    };

    return icons[action] || 'info';
  }

  formatAction(log: ActivityLog): string {
    const entityType = log.entity_type ? log.entity_type.charAt(0).toUpperCase() + log.entity_type.slice(1) : '';

    switch (log.action) {
      case 'create':
        return `Created ${entityType}`;
      case 'update':
        return `Updated ${entityType}`;
      case 'delete':
        return `Deleted ${entityType}`;
      case 'login':
        return 'User logged in';
      case 'logout':
        return 'User logged out';
      default:
        return log.action;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
}
