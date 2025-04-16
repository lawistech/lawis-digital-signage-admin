import { Component, OnInit } from '@angular/core';
import { ActivityLogService, ActivityLog } from '../../services/activity-log.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-activity-logs',
  template: `
    <div class="p-6">
      <div class="mb-6 flex justify-between items-center">
        <h1 class="text-2xl font-semibold text-slate-800">Activity Logs</h1>
        <div class="flex space-x-2">
          <button 
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            (click)="refreshLogs()">
            <span class="material-icons text-sm mr-1">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      <!-- Activity Logs Table -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngIf="loading">
                <td colspan="4" class="px-6 py-4 text-center">
                  <div class="flex justify-center">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!loading && activityLogs.length === 0">
                <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                  No activity logs found
                </td>
              </tr>
              <tr *ngFor="let log of activityLogs" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="bg-blue-100 text-blue-800 rounded-full p-1 mr-2">
                      <span class="material-icons text-sm">{{getActionIcon(log.action)}}</span>
                    </div>
                    <span>{{formatAction(log)}}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-900">{{log.entity_type || 'N/A'}}</span>
                  <span class="text-xs text-gray-500 block">ID: {{log.entity_id || 'N/A'}}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-900">{{log.user_email || 'Unknown user'}}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{formatDate(log.created_at)}}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div class="flex-1 flex justify-between sm:hidden">
            <button 
              [disabled]="currentPage === 1"
              (click)="goToPage(currentPage - 1)"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              [class.opacity-50]="currentPage === 1">
              Previous
            </button>
            <button 
              [disabled]="currentPage >= totalPages"
              (click)="goToPage(currentPage + 1)"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              [class.opacity-50]="currentPage >= totalPages">
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">{{(currentPage - 1) * pageSize + 1}}</span> to 
                <span class="font-medium">{{Math.min(currentPage * pageSize, totalItems)}}</span> of 
                <span class="font-medium">{{totalItems}}</span> results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button 
                  [disabled]="currentPage === 1"
                  (click)="goToPage(currentPage - 1)"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  [class.opacity-50]="currentPage === 1">
                  <span class="sr-only">Previous</span>
                  <span class="material-icons text-sm">chevron_left</span>
                </button>
                
                <ng-container *ngFor="let page of getPageNumbers()">
                  <button 
                    (click)="goToPage(page)"
                    [class]="page === currentPage 
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium' 
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium'">
                    {{page}}
                  </button>
                </ng-container>
                
                <button 
                  [disabled]="currentPage >= totalPages"
                  (click)="goToPage(currentPage + 1)"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  [class.opacity-50]="currentPage >= totalPages">
                  <span class="sr-only">Next</span>
                  <span class="material-icons text-sm">chevron_right</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ActivityLogsComponent implements OnInit {
  activityLogs: ActivityLog[] = [];
  loading = true;
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 1;
  Math = Math; // Make Math available in the template

  constructor(private activityLogService: ActivityLogService) {}

  ngOnInit() {
    this.loadActivityLogs();
  }

  loadActivityLogs() {
    this.loading = true;
    this.activityLogService.getAllActivityLogs(this.currentPage, this.pageSize)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (result) => {
          this.activityLogs = result.logs;
          this.totalItems = result.total;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        },
        error: (error) => {
          console.error('Error loading activity logs:', error);
        }
      });
  }

  refreshLogs() {
    this.loadActivityLogs();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadActivityLogs();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      // If we have fewer pages than the max, show all pages
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include the first page
      pages.push(1);
      
      // Calculate the range of pages to show around the current page
      let startPage = Math.max(2, this.currentPage - 1);
      let endPage = Math.min(this.totalPages - 1, this.currentPage + 1);
      
      // Adjust if we're at the beginning or end
      if (startPage === 2) {
        endPage = Math.min(this.totalPages - 1, startPage + 2);
      } else if (endPage === this.totalPages - 1) {
        startPage = Math.max(2, endPage - 2);
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add the range of pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < this.totalPages - 1) {
        pages.push(-2); // -2 represents ellipsis
      }
      
      // Always include the last page
      pages.push(this.totalPages);
    }
    
    return pages;
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
