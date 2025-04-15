import { Component, OnInit } from '@angular/core';
import { UserManagementService, User } from '../../services/user-management.service';

@Component({
  selector: 'app-archive',
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Archive Management</h1>
          <p class="text-sm text-slate-500 mt-1">Archive users and organizations instead of deleting them</p>
        </div>
      </div>

      <!-- Error message -->
      <div *ngIf="errorMessage && !isLoading" class="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
        <span class="material-icons mr-2">error</span>
        {{ errorMessage }}
        <button (click)="errorMessage = ''" class="ml-auto text-red-500 hover:text-red-700">
          <span class="material-icons">close</span>
        </button>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            (click)="activeTab = 'users'"
            class="py-4 px-1 border-b-2 font-medium text-sm"
            [class.border-indigo-500]="activeTab === 'users'"
            [class.text-indigo-600]="activeTab === 'users'"
            [class.border-transparent]="activeTab !== 'users'"
            [class.text-gray-500]="activeTab !== 'users'"
            [class.hover:text-gray-700]="activeTab !== 'users'"
            [class.hover:border-gray-300]="activeTab !== 'users'"
          >
            <div class="flex items-center">
              <span class="material-icons mr-2">people</span>
              Users
            </div>
          </button>
          <button
            (click)="activeTab = 'organizations'"
            class="py-4 px-1 border-b-2 font-medium text-sm"
            [class.border-indigo-500]="activeTab === 'organizations'"
            [class.text-indigo-600]="activeTab === 'organizations'"
            [class.border-transparent]="activeTab !== 'organizations'"
            [class.text-gray-500]="activeTab !== 'organizations'"
            [class.hover:text-gray-700]="activeTab !== 'organizations'"
            [class.hover:border-gray-300]="activeTab !== 'organizations'"
          >
            <div class="flex items-center">
              <span class="material-icons mr-2">business</span>
              Organizations
            </div>
          </button>
        </nav>
      </div>

      <!-- Users Archive Tab -->
      <div *ngIf="activeTab === 'users'" class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <!-- Advanced filters -->
        <div class="p-5 border-b border-slate-200">
          <div class="flex flex-col md:flex-row md:items-center gap-4">
            <!-- Search -->
            <div class="relative flex-grow">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="material-icons text-slate-400 text-lg">search</span>
              </div>
              <input
                type="text"
                placeholder="Search users by name or email..."
                class="pl-10 pr-4 py-2 border border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md w-full text-sm text-slate-700"
                [(ngModel)]="searchTerm"
                (keyup.enter)="loadUsers()"
              >
            </div>

            <div class="flex flex-wrap gap-3">
              <!-- Role filter -->
              <div class="relative">
                <select
                  class="appearance-none pl-3 pr-8 py-2 border border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md text-sm text-slate-700 bg-white"
                  [(ngModel)]="selectedRole"
                  (change)="loadUsers()"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <span class="material-icons text-slate-400 text-sm">expand_more</span>
                </div>
              </div>

              <!-- Reset filters button -->
              <button
                (click)="resetFilters()"
                class="px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-700 hover:bg-slate-50 flex items-center transition-colors duration-150"
              >
                <span class="material-icons text-sm mr-1">refresh</span>
                Reset
              </button>
            </div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div *ngIf="isLoading" class="p-10 text-center">
          <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600 mb-4"></div>
          <p class="text-slate-500 font-medium">Loading users...</p>
        </div>

        <!-- Error message -->
        <div *ngIf="errorMessage && !isLoading" class="p-10 text-center">
          <div class="inline-flex flex-col items-center">
            <div class="h-16 w-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-4">
              <span class="material-icons text-3xl">error_outline</span>
            </div>
            <h3 class="text-lg font-medium text-slate-800 mb-2">Error Loading Users</h3>
            <p class="text-slate-600 mb-6 max-w-md mx-auto">{{ errorMessage }}</p>
            <button
              (click)="loadUsers()"
              class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center transition-colors duration-200 shadow-sm mx-auto"
            >
              <span class="material-icons text-sm mr-2">autorenew</span>
              Try Again
            </button>
          </div>
        </div>

        <!-- Users table -->
        <table *ngIf="!isLoading && !errorMessage && activeTab === 'users'" class="min-w-full divide-y divide-slate-200">
          <thead>
            <tr class="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              <th class="px-6 py-4">
                <div class="flex items-center">
                  <span class="font-semibold">User & Subscription</span>
                </div>
              </th>
              <th class="px-6 py-4 font-semibold">Role</th>
              <th class="px-6 py-4 font-semibold">Organization & Resources</th>
              <th class="px-6 py-4 font-semibold">Last Active</th>
              <th class="px-6 py-4 text-right font-semibold">Actions</th>
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
                                'bg-red-100 text-red-800': user.subscription_status === 'inactive',
                                'bg-gray-100 text-gray-800': user.subscription_status === 'archived'
                              }"
                              [title]="'Status: ' + (user.subscription_status || 'inactive') + ' | Renewal: ' + formatNextBillingDate(user.subscription_renewal_date)">
                          {{ user.subscription_tier | titlecase }}
                        </span>
                        <span class="text-xs text-gray-500" [title]="'Created: ' + formatDate(user.created_at)">
                          {{ getTimeAgo(user.created_at) }}
                        </span>
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
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  (click)="archiveUser(user)"
                  class="text-amber-600 hover:text-amber-900 mr-3 flex items-center"
                >
                  <span class="material-icons text-sm mr-1">archive</span>
                  Archive
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

        <div *ngIf="!isLoading && !errorMessage" class="px-6 py-5 border-t border-slate-200 flex items-center justify-between bg-white">
          <div class="text-sm text-slate-600 flex items-center">
            <span class="material-icons text-indigo-500 mr-2 text-sm">people</span>
            Showing <span class="font-medium mx-1">{{ users.length }}</span> users
          </div>
          <div class="flex items-center space-x-4">
            <button
              (click)="previousPage()"
              class="px-4 py-2 border border-slate-300 rounded-md text-sm text-slate-700 hover:bg-slate-50 flex items-center transition-colors duration-150 shadow-sm"
              [disabled]="currentPage === 1 || isLoading"
              [ngClass]="{'opacity-50 cursor-not-allowed': currentPage === 1 || isLoading}"
            >
              <span class="material-icons text-sm mr-1">chevron_left</span>
              Previous
            </button>
            <div class="px-4 py-2 bg-slate-100 rounded-md text-sm font-medium text-slate-700">
              Page {{ currentPage }}
            </div>
            <button
              (click)="nextPage()"
              class="px-4 py-2 border border-slate-300 rounded-md text-sm text-slate-700 hover:bg-slate-50 flex items-center transition-colors duration-150 shadow-sm"
              [disabled]="users.length < pageSize || isLoading"
              [ngClass]="{'opacity-50 cursor-not-allowed': users.length < pageSize || isLoading}"
            >
              Next
              <span class="material-icons text-sm ml-1">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Organizations Archive Tab -->
      <div *ngIf="activeTab === 'organizations'" class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-10 text-center">
          <div class="inline-flex flex-col items-center">
            <div class="h-16 w-16 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mb-4">
              <span class="material-icons text-3xl">business</span>
            </div>
            <h3 class="text-lg font-medium text-slate-800 mb-2">Organization Archive</h3>
            <p class="text-slate-600 mb-6 max-w-md mx-auto">
              This feature will be available soon. You will be able to archive organizations instead of deleting them.
            </p>
          </div>
        </div>
      </div>

      <!-- Archive Confirmation Dialog -->
      <div *ngIf="showArchiveConfirmation" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">Confirm Archive</h2>
            <button (click)="showArchiveConfirmation = false" class="text-gray-500 hover:text-gray-700">
              <span class="material-icons">close</span>
            </button>
          </div>

          <p class="mb-4">Are you sure you want to archive the user <strong>{{ selectedUser?.full_name || selectedUser?.email }}</strong>?</p>
          <p class="mb-6 text-amber-600">Archived users will be hidden from the main user list but can be restored later.</p>

          <div class="flex justify-end space-x-2">
            <button
              (click)="showArchiveConfirmation = false"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              (click)="confirmArchiveUser()"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              [disabled]="isArchiving"
              [class.opacity-50]="isArchiving"
            >
              <span *ngIf="isArchiving" class="material-icons animate-spin mr-1 text-sm">refresh</span>
              {{ isArchiving ? 'Archiving...' : 'Archive User' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ArchiveComponent implements OnInit {
  users: User[] = [];
  isLoading = false;
  errorMessage = '';
  currentPage = 1;
  pageSize = 10;
  searchTerm = '';
  selectedRole = 'all';
  totalUsers = 0;
  selectedUser: User | null = null;
  showArchiveConfirmation = false;
  isArchiving = false;
  activeTab = 'users'; // 'users' or 'organizations'

  constructor(private userService: UserManagementService) {}

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Apply filters
    const filters = {
      role: this.selectedRole !== 'all' ? this.selectedRole : undefined,
      searchTerm: this.searchTerm || undefined
    };

    this.userService.getUsers(this.currentPage, this.pageSize, filters).subscribe({
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
    this.userService.getUserCount(filters).subscribe({
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

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedRole = 'all';
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

  getLoginFrequency(user: User): string {
    // This is a placeholder - in a real app, you would calculate this based on login history
    if (!user.last_sign_in_at) return 'No logins';

    // For demo purposes, return a random frequency
    const frequencies = ['Frequent', 'Regular', 'Occasional', 'Rare'];
    const randomIndex = Math.floor(Math.random() * frequencies.length);
    return frequencies[randomIndex];
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

  archiveUser(user: User): void {
    this.selectedUser = user;
    this.showArchiveConfirmation = true;
  }

  confirmArchiveUser(): void {
    if (!this.selectedUser) return;

    this.isArchiving = true;

    // Update the user's status to 'archived'
    const userData: Partial<User> = {
      subscription_status: 'archived'
    };

    this.userService.updateUser(this.selectedUser.id, userData).subscribe({
      next: () => {
        // Remove the user from the local array or update its status
        const index = this.users.findIndex(u => u.id === this.selectedUser?.id);
        if (index !== -1) {
          this.users[index].subscription_status = 'archived';
        }
        this.isArchiving = false;
        this.showArchiveConfirmation = false;
        this.selectedUser = null;
      },
      error: (error) => {
        console.error('Error archiving user:', error);
        this.isArchiving = false;
        this.errorMessage = 'Failed to archive user. ' + (error.message || 'Please try again.');
      }
    });
  }
}
