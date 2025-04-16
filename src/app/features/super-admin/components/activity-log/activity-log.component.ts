import { Component, OnInit, Input } from '@angular/core';
import { finalize } from 'rxjs';
import { ActivityLogService, ActivityLog } from '../../services/activity-log.service';

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
  @Input() limit: number = 10;
  activityLogs: ActivityLog[] = [];
  loading = true;

  constructor(private activityLogService: ActivityLogService) {}

  ngOnInit() {
    this.loadActivityLogs();
  }

  private loadActivityLogs() {
    this.loading = true;
    this.activityLogService.getRecentActivityLogs(this.limit)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (logs) => {
          this.activityLogs = logs;
        },
        error: (error) => {
          console.error('Error loading activity logs:', error);
        }
      });
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
