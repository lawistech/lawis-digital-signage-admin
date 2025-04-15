import { Component, OnInit } from '@angular/core';
import { UserManagementService, User } from '../../services/user-management.service';

@Component({
  selector: 'app-users',
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">User Management</h1>
        <button
          (click)="showAddUserDialog = true"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <span class="material-icons mr-1">person_add</span>
          Add User
        </button>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="p-4 border-b flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <span class="material-icons text-gray-500">search</span>
            <input
              type="text"
              placeholder="Search users..."
              class="border-none focus:ring-0 text-sm"
              [(ngModel)]="searchTerm"
              (keyup.enter)="loadUsers()"
            >
          </div>
          <div class="flex space-x-2">
            <select
              class="text-sm border-gray-300 rounded-md"
              [(ngModel)]="selectedRole"
              (change)="loadUsers()"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </div>

        <!-- Loading indicator -->
        <div *ngIf="isLoading" class="p-6 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p class="text-gray-500">Loading users...</p>
        </div>

        <!-- Error message -->
        <div *ngIf="errorMessage && !isLoading" class="p-6 text-center">
          <div class="bg-red-50 text-red-600 p-4 rounded-lg inline-flex items-center">
            <span class="material-icons mr-2">error</span>
            {{ errorMessage }}
          </div>
          <button (click)="loadUsers()" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Try Again
          </button>
        </div>

        <!-- Users table -->
        <table *ngIf="!isLoading && !errorMessage" class="min-w-full">
          <thead>
            <tr class="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th class="px-6 py-3">User & Subscription</th>
              <th class="px-6 py-3">Role</th>
              <th class="px-6 py-3">Organization & Resources</th>
              <th class="px-6 py-3">Last Active</th>
              <th class="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let user of users" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {{ getInitials(user.full_name || user.email) }}
                  </div>
                  <div class="ml-4 w-full">
                    <div class="text-sm font-medium text-gray-900">{{ user.full_name || 'N/A' }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                    <div class="mt-2">
                      <!-- Subscription Badge with Tooltip -->
                      <div class="flex items-center mb-1">
                        <span class="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full mr-2"
                              [ngClass]="{
                                'bg-green-100 text-green-800': user.subscription_status === 'active',
                                'bg-yellow-100 text-yellow-800': user.subscription_status === 'pending',
                                'bg-red-100 text-red-800': user.subscription_status === 'inactive'
                              }"
                              [title]="'Status: ' + (user.subscription_status || 'inactive') + ' | Renewal: ' + formatNextBillingDate(user.subscription_renewal_date)">
                          {{ user.subscription_tier | titlecase }}
                        </span>
                        <span class="text-xs text-gray-500" [title]="'Created: ' + formatDate(user.created_at)">
                          {{ getTimeAgo(user.created_at) }}
                        </span>
                      </div>

                      <!-- Screen Usage with Progress Bar -->
                      <div class="flex items-center mb-1" title="Screen Usage">
                        <span class="material-icons text-xs mr-1 text-blue-600">desktop_windows</span>
                        <span class="text-xs text-gray-700 mr-2">{{ user.screen_count || 0 }}/{{ user.max_screens || 1 }}</span>
                        <div class="w-24 bg-gray-200 rounded-full h-1.5">
                          <div class="bg-blue-600 h-1.5 rounded-full" [style.width.%]="getPercentage(user.screen_count || 0, user.max_screens || 1)"></div>
                        </div>
                      </div>

                      <!-- Payment Status if available -->
                      <div *ngIf="user.payment_status" class="flex items-center text-xs">
                        <span class="material-icons text-xs mr-1"
                              [ngClass]="{
                                'text-green-600': user.payment_status === 'paid',
                                'text-yellow-600': user.payment_status === 'pending',
                                'text-red-600': user.payment_status === 'failed'
                              }">payments</span>
                        <span [ngClass]="{
                                'text-green-600': user.payment_status === 'paid',
                                'text-yellow-600': user.payment_status === 'pending',
                                'text-red-600': user.payment_status === 'failed'
                              }">{{ user.payment_status | titlecase }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="{
                        'bg-purple-100 text-purple-800': user.role === 'super_admin',
                        'bg-blue-100 text-blue-800': user.role === 'admin',
                        'bg-green-100 text-green-800': user.role === 'user'
                      }">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ user.organization_name || 'N/A' }}</div>
                <div *ngIf="user.organization_id" class="mt-2 space-y-2">
                  <!-- Storage Usage with Progress Bar -->
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center" title="Storage Usage">
                        <span class="material-icons text-xs mr-1 text-purple-600">storage</span>
                        <span class="text-xs text-gray-700">Storage</span>
                      </div>
                      <span class="text-xs text-gray-500">
                        {{ formatStorage(user.storage_usage) }}/{{ formatStorage(user.max_storage) }}
                      </span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-1.5">
                      <div class="bg-purple-600 h-1.5 rounded-full"
                           [style.width.%]="getPercentage(user.storage_usage || 0, user.max_storage || 1)"
                           [title]="getPercentage(user.storage_usage || 0, user.max_storage || 1) + '% used'"></div>
                    </div>
                  </div>

                  <!-- Organization Details -->
                  <div *ngIf="user.organization_created_at" class="text-xs text-gray-500 flex items-center">
                    <span class="material-icons text-xs mr-1">business</span>
                    <span title="Organization Created">{{ getTimeAgo(user.organization_created_at) }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-700" title="{{ formatDate(user.last_sign_in_at) }}">
                  {{ getTimeAgo(user.last_sign_in_at) }}
                </div>
                <div class="text-xs text-gray-500 mt-1 flex items-center">
                  <span class="material-icons text-xs mr-1">history</span>
                  <span>{{ getLoginFrequency(user) }}</span>
                </div>
                <div *ngIf="user.last_active_screen" class="text-xs text-gray-500 mt-1 flex items-center">
                  <span class="material-icons text-xs mr-1">monitor</span>
                  <span title="Last Active Screen">{{ user.last_active_screen }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  (click)="editUser(user)"
                  class="text-blue-600 hover:text-blue-900 mr-3 flex items-center"
                >
                  <span class="material-icons text-sm mr-1">edit</span>
                  Edit
                </button>
                <button
                  (click)="confirmDeleteUser(user)"
                  class="text-red-600 hover:text-red-900 flex items-center"
                >
                  <span class="material-icons text-sm mr-1">delete</span>
                  Delete
                </button>
              </td>
            </tr>

            <tr *ngIf="users.length === 0 && !isLoading && !errorMessage">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                No users found
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!isLoading && !errorMessage" class="px-6 py-4 border-t flex items-center justify-between">
          <div class="text-sm text-gray-500">
            Showing <span class="font-medium">{{ users.length }}</span> users
          </div>
          <div class="flex space-x-2">
            <button
              (click)="previousPage()"
              class="px-3 py-1 border rounded text-sm"
              [disabled]="currentPage === 1 || isLoading"
              [ngClass]="{'opacity-50 cursor-not-allowed': currentPage === 1 || isLoading, 'hover:bg-gray-100': currentPage > 1 && !isLoading}"
            >
              Previous
            </button>
            <span class="px-3 py-1 text-sm">Page {{ currentPage }}</span>
            <button
              (click)="nextPage()"
              class="px-3 py-1 border rounded text-sm"
              [disabled]="users.length < pageSize || isLoading"
              [ngClass]="{'opacity-50 cursor-not-allowed': users.length < pageSize || isLoading, 'hover:bg-gray-100': users.length >= pageSize && !isLoading}"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add User Dialog -->
    <app-add-user-dialog
      *ngIf="showAddUserDialog"
      (close)="showAddUserDialog = false"
      (userCreated)="onUserCreated($event)"
    ></app-add-user-dialog>

    <!-- Edit User Dialog -->
    <app-edit-user-dialog
      *ngIf="showEditUserDialog && selectedUser"
      [user]="selectedUser"
      (close)="showEditUserDialog = false"
      (userUpdated)="onUserUpdated($event)"
    ></app-edit-user-dialog>

    <!-- Delete Confirmation Dialog -->
    <div *ngIf="showDeleteConfirmation" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Confirm Delete</h2>
          <button (click)="showDeleteConfirmation = false" class="text-gray-500 hover:text-gray-700">
            <span class="material-icons">close</span>
          </button>
        </div>

        <p class="mb-4">Are you sure you want to delete the user <strong>{{ selectedUser?.full_name || selectedUser?.email }}</strong>?</p>
        <p class="mb-6 text-red-600">This action cannot be undone.</p>

        <div class="flex justify-end space-x-2">
          <button
            (click)="showDeleteConfirmation = false"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            (click)="deleteUser()"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            [disabled]="isDeleting"
            [class.opacity-50]="isDeleting"
          >
            <span *ngIf="isDeleting" class="material-icons animate-spin mr-1 text-sm">refresh</span>
            {{ isDeleting ? 'Deleting...' : 'Delete User' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  isLoading = false;
  errorMessage = '';
  currentPage = 1;
  pageSize = 10;
  showAddUserDialog = false;
  showEditUserDialog = false;
  showDeleteConfirmation = false;
  searchTerm = '';
  selectedRole = 'all';
  totalUsers = 0;
  selectedUser: User | null = null;
  isDeleting = false;

  constructor(private userService: UserManagementService) {}

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getUsers(this.currentPage, this.pageSize).subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Failed to load users. Please try again.';
        this.isLoading = false;
      }
    });

    // Get total user count for pagination
    this.userService.getUserCount().subscribe({
      next: (count) => {
        this.totalUsers = count;
      },
      error: (error) => {
        console.error('Error getting user count:', error);
      }
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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

  getLoginFrequency(user: User): string {
    // This is a placeholder - in a real app, you would calculate this based on login history
    if (!user.last_sign_in_at) return 'No logins';

    // For demo purposes, return a random frequency
    const frequencies = ['Frequent', 'Regular', 'Occasional', 'Rare'];
    const randomIndex = Math.floor(Math.random() * frequencies.length);
    return frequencies[randomIndex];
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

  previousPage(): void {
    if (this.currentPage > 1 && !this.isLoading) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (!this.isLoading && this.users.length === this.pageSize) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  onUserCreated(_: any): void {
    // Reload the users list to include the new user
    this.loadUsers();
  }

  editUser(user: User): void {
    this.selectedUser = user;
    this.showEditUserDialog = true;
  }

  onUserUpdated(updatedUser: User): void {
    // Update the user in the local array
    const index = this.users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      this.users[index] = updatedUser;
    }
    // Close the dialog
    this.showEditUserDialog = false;
    this.selectedUser = null;
  }

  confirmDeleteUser(user: User): void {
    this.selectedUser = user;
    this.showDeleteConfirmation = true;
  }

  deleteUser(): void {
    if (!this.selectedUser) return;

    this.isDeleting = true;

    this.userService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        // Remove the user from the local array
        this.users = this.users.filter(u => u.id !== this.selectedUser?.id);
        this.isDeleting = false;
        this.showDeleteConfirmation = false;
        this.selectedUser = null;
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.isDeleting = false;
        // You could show an error message here
      }
    });
  }
}
