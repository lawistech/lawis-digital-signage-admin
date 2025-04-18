import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User, UserManagementService } from '../../services/user-management.service';

@Component({
  selector: 'app-user-details-dialog',
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <!-- Header with improved styling - fixed at top -->
        <div class="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <div class="flex items-center">
            <span class="material-icons text-blue-600 mr-2">person</span>
            <h2 class="text-xl font-bold text-gray-800">User Details</h2>
          </div>
          <button (click)="onClose()" class="text-gray-500 hover:text-gray-700 transition-colors">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Scrollable content area -->
        <div class="overflow-y-auto p-6 pt-0">

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- User Profile Section -->
          <div class="md:col-span-1 bg-gray-50 p-4 rounded-lg">
            <div class="flex flex-col items-center">
              <div class="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl font-bold mb-3">
                {{ getInitials(user.full_name || user.email) }}
              </div>
              <h3 class="text-lg font-medium text-gray-900">{{ user.full_name || 'N/A' }}</h3>
              <a href="mailto:{{ user.email }}" class="text-sm text-blue-600 hover:text-blue-800 mb-2 flex items-center justify-center" title="Click to email this user">
                <span class="material-icons text-sm mr-1">email</span>
                {{ user.email }}
              </a>
              <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mb-3"
                    [ngClass]="{
                      'bg-green-100 text-green-800': user.payment_status === 'paid',
                      'bg-yellow-100 text-yellow-800': user.payment_status === 'pending',
                      'bg-red-100 text-red-800': user.payment_status === 'failed'
                    }">
                {{ user.payment_status | titlecase }}
              </span>
              <div class="text-xs text-gray-500 mb-1">
                Role: {{ user.role }}
              </div>
              <div class="text-xs text-gray-500">
                Created {{ formatDate(user.created_at) }}
              </div>
              <div class="text-xs text-gray-500">
                Last active {{ getTimeAgo(user.last_sign_in_at) }}
              </div>
              <div class="flex space-x-2 mt-4">
                <button
                  (click)="onEdit()"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center text-sm"
                >
                  <span class="material-icons text-sm mr-1">edit</span>
                  Edit
                </button>
                <button
                  (click)="onDelete()"
                  class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center text-sm"
                >
                  <span class="material-icons text-sm mr-1">delete</span>
                  Delete
                </button>
              </div>
            </div>
          </div>

          <!-- Subscription & Usage Section -->
          <div class="md:col-span-2">
            <div class="bg-white p-4 rounded-lg border border-gray-200 mb-4">
              <h3 class="text-lg font-medium text-gray-900 mb-3">Subscription Details</h3>

              <div class="flex items-center mb-3">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mr-2"
                      [ngClass]="{
                        'bg-green-100 text-green-800': user.subscription_status === 'active',
                        'bg-yellow-100 text-yellow-800': user.subscription_status === 'pending',
                        'bg-red-100 text-red-800': user.subscription_status === 'inactive'
                      }">
                  {{ user.subscription_status || 'inactive' }}
                </span>
                <span class="text-sm font-medium text-gray-700">{{ user.subscription_tier | titlecase }} Plan</span>
              </div>

              <div class="text-sm text-gray-600 mb-1">
                Renewal Date: {{ formatNextBillingDate(user.subscription_renewal_date) }}
              </div>

              <!-- Payment Status if available -->
              <div *ngIf="user.payment_status" class="flex items-center text-sm mb-3">
                <span class="material-icons text-sm mr-1"
                      [ngClass]="{
                        'text-green-600': user.payment_status === 'paid',
                        'text-yellow-600': user.payment_status === 'pending',
                        'text-red-600': user.payment_status === 'failed'
                      }">payments</span>
                <span [ngClass]="{
                        'text-green-600': user.payment_status === 'paid',
                        'text-yellow-600': user.payment_status === 'pending',
                        'text-red-600': user.payment_status === 'failed'
                      }">Payment Status: {{ user.payment_status | titlecase }}</span>
              </div>
            </div>

            <div class="bg-white p-4 rounded-lg border border-gray-200">
              <h3 class="text-lg font-medium text-gray-900 mb-3">Resource Usage</h3>

              <!-- Screen Usage with Progress Bar -->
              <div class="mb-4">
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center">
                    <span class="material-icons text-sm mr-1 text-blue-600">desktop_windows</span>
                    <span class="text-sm font-medium text-gray-700">Screen Usage</span>
                  </div>
                  <span class="text-sm text-gray-600">{{ user.screen_count || 0 }}/{{ user.max_screens || 1 }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full"
                       [style.width.%]="getPercentage(user.screen_count || 0, user.max_screens || 1)"></div>
                </div>
              </div>

              <!-- Storage Usage with Progress Bar -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center">
                    <span class="material-icons text-sm mr-1 text-purple-600">storage</span>
                    <span class="text-sm font-medium text-gray-700">Storage Usage</span>
                  </div>
                  <span class="text-sm text-gray-600">
                    {{ formatStorage(user.storage_usage) }}/{{ formatStorage(user.max_storage) }}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-purple-600 h-2 rounded-full"
                       [style.width.%]="getPercentage(user.storage_usage || 0, user.max_storage || 1)"></div>
                </div>
              </div>
            </div>

            <!-- Last Active Screen -->
            <div *ngIf="user.last_active_screen" class="bg-white p-4 rounded-lg border border-gray-200 mt-4">
              <div class="flex items-center">
                <span class="material-icons text-sm mr-2 text-gray-600">monitor</span>
                <div>
                  <div class="text-sm font-medium text-gray-700">Last Active Screen</div>
                  <div class="text-sm text-gray-600">{{ user.last_active_screen }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end mt-6 pt-4 border-t">
          <button
            (click)="onClose()"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
        </div>
      </div>
    </div>
  `
})
export class UserDetailsDialogComponent {
  @Input() user!: User;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  isDeleting = false;

  constructor(private userService: UserManagementService) {}

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  getTimeAgo(dateString: string | null): string {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffMonth / 12);

    if (diffYear > 0) return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
    if (diffMonth > 0) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
    if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  formatNextBillingDate(dateString: string | null | undefined): string {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  getPercentage(current: number, max: number): number {
    if (max === 0) return 0;
    return Math.min(Math.round((current / max) * 100), 100);
  }

  formatStorage(bytes: number | undefined): string {
    if (bytes === undefined) return '0 MB';

    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    } else {
      return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    this.edit.emit();
  }

  onDelete(): void {
    if (confirm(`Are you sure you want to delete user ${this.user.full_name || this.user.email}? This action cannot be undone.`)) {
      this.isDeleting = true;
      this.userService.deleteUser(this.user.id, this.user.email).subscribe({
        next: () => {
          this.isDeleting = false;
          this.deleted.emit();
          this.close.emit();
        },
        error: (error) => {
          this.isDeleting = false;
          console.error('Error deleting user:', error);
          alert('Failed to delete user. Please try again.');
        }
      });
    }
  }
}
