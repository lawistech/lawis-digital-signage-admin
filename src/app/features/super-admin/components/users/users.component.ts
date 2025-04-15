import { Component, OnInit } from '@angular/core';
import { UserManagementService, User } from '../../services/user-management.service';

@Component({
  selector: 'app-users',
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">User Management</h1>
        <div class="flex space-x-2">
          <!-- Export dropdown -->
          <div class="relative">
            <button
              (click)="showExportMenu = !showExportMenu"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              [disabled]="isExporting"
              [class.opacity-50]="isExporting"
            >
              <span class="material-icons mr-1">download</span>
              {{ isExporting ? 'Exporting...' : 'Export' }}
            </button>
            <div *ngIf="showExportMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <div class="py-1">
                <button
                  (click)="exportUserData('csv'); showExportMenu = false"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export as CSV
                </button>
                <button
                  (click)="exportUserData('json'); showExportMenu = false"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export as JSON
                </button>
              </div>
            </div>
          </div>

          <!-- Add user button -->
          <button
            (click)="showAddUserDialog = true"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <span class="material-icons mr-1">person_add</span>
            Add User
          </button>
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

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <!-- Advanced filters -->
        <div class="p-4 border-b">
          <div class="flex flex-wrap items-center gap-4">
            <!-- Search -->
            <div class="flex items-center space-x-2 flex-grow">
              <span class="material-icons text-gray-500">search</span>
              <input
                type="text"
                placeholder="Search users..."
                class="border-none focus:ring-0 text-sm flex-grow"
                [(ngModel)]="searchTerm"
                (keyup.enter)="loadUsers()"
              >
            </div>

            <!-- Role filter -->
            <div>
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

            <!-- Status filter -->
            <div>
              <select
                class="text-sm border-gray-300 rounded-md"
                [(ngModel)]="selectedStatus"
                (change)="loadUsers()"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <!-- Subscription tier filter -->
            <div>
              <select
                class="text-sm border-gray-300 rounded-md"
                [(ngModel)]="selectedTier"
                (change)="loadUsers()"
              >
                <option value="all">All Tiers</option>
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <!-- Date filter -->
            <div>
              <select
                class="text-sm border-gray-300 rounded-md"
                [(ngModel)]="dateFilter"
                (change)="loadUsers()"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            <!-- Reset filters button -->
            <button
              (click)="resetFilters()"
              class="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <span class="material-icons text-sm mr-1">refresh</span>
              Reset
            </button>
          </div>
        </div>

        <!-- Bulk actions -->
        <div *ngIf="selectedUsers.length > 0" class="bg-blue-50 p-4 border-b flex justify-between items-center">
          <div class="text-sm text-blue-800">
            <span class="font-medium">{{ selectedUsers.length }}</span> users selected
          </div>
          <div class="flex space-x-2">
            <!-- Bulk actions dropdown -->
            <div class="relative">
              <button
                (click)="showBulkActionMenu = !showBulkActionMenu"
                class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm flex items-center"
              >
                Bulk Actions
                <span class="material-icons ml-1 text-sm">arrow_drop_down</span>
              </button>
              <div *ngIf="showBulkActionMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div class="py-1">
                  <button
                    (click)="performBulkAction('changeRole'); showBulkActionMenu = false"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Change Role
                  </button>
                  <button
                    (click)="performBulkAction('changeStatus'); showBulkActionMenu = false"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Change Status
                  </button>
                  <button
                    (click)="performBulkAction('delete'); showBulkActionMenu = false"
                    class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            </div>

            <!-- Cancel selection -->
            <button
              (click)="selectedUsers = []"
              class="text-gray-600 hover:text-gray-800 px-3 py-1 rounded border border-gray-300 text-sm"
            >
              Cancel
            </button>
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
              <th class="px-6 py-3">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 rounded mr-2"
                    [checked]="selectedUsers.length === users.length && users.length > 0"
                    (change)="selectAllUsers()"
                  >
                  User & Subscription
                </div>
              </th>
              <th class="px-6 py-3">Role</th>
              <th class="px-6 py-3">Organization & Resources</th>
              <th class="px-6 py-3">Last Active</th>
              <th class="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let user of users" class="hover:bg-gray-50" [class.bg-blue-50]="isUserSelected(user.id)">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 rounded mr-2"
                    [checked]="isUserSelected(user.id)"
                    (change)="toggleUserSelection(user.id)"
                  >
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

    <!-- Bulk Action Dialog -->
    <app-bulk-action-dialog
      *ngIf="showBulkActionDialog"
      [actionType]="bulkActionType"
      [userCount]="selectedUsers.length"
      (close)="showBulkActionDialog = false"
      (applyAction)="applyBulkAction($event)"
    ></app-bulk-action-dialog>
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
  selectedStatus = 'all';
  selectedTier = 'all';
  dateFilter = 'all';
  totalUsers = 0;
  selectedUser: User | null = null;
  isDeleting = false;
  selectedUsers: string[] = [];
  showBulkActionMenu = false;
  showExportMenu = false;
  isExporting = false;
  showBulkActionDialog = false;
  bulkActionType: 'role' | 'status' = 'role';

  constructor(private userService: UserManagementService) {}

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.selectedUsers = [];

    // Apply filters
    const filters = {
      role: this.selectedRole !== 'all' ? this.selectedRole : undefined,
      status: this.selectedStatus !== 'all' ? this.selectedStatus : undefined,
      tier: this.selectedTier !== 'all' ? this.selectedTier : undefined,
      searchTerm: this.searchTerm || undefined,
      dateFilter: this.dateFilter !== 'all' ? this.dateFilter : undefined
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
    this.selectedStatus = 'all';
    this.selectedTier = 'all';
    this.dateFilter = 'all';
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
        this.errorMessage = 'Failed to delete user. ' + (error.message || 'Please try again.');
      }
    });
  }

  // Bulk selection methods
  toggleUserSelection(userId: string): void {
    const index = this.selectedUsers.indexOf(userId);
    if (index === -1) {
      this.selectedUsers.push(userId);
    } else {
      this.selectedUsers.splice(index, 1);
    }
  }

  isUserSelected(userId: string): boolean {
    return this.selectedUsers.includes(userId);
  }

  selectAllUsers(): void {
    if (this.selectedUsers.length === this.users.length) {
      // If all are selected, deselect all
      this.selectedUsers = [];
    } else {
      // Otherwise select all
      this.selectedUsers = this.users.map(user => user.id);
    }
  }

  // Bulk actions
  performBulkAction(action: string): void {
    if (this.selectedUsers.length === 0) return;

    switch (action) {
      case 'delete':
        this.confirmBulkDelete();
        break;
      case 'changeRole':
        this.bulkActionType = 'role';
        this.showBulkActionDialog = true;
        break;
      case 'changeStatus':
        this.bulkActionType = 'status';
        this.showBulkActionDialog = true;
        break;
      default:
        break;
    }
  }

  applyBulkAction(action: {type: string, value: string}): void {
    if (this.selectedUsers.length === 0) return;

    this.isLoading = true;

    // Create an array of observables for each update operation
    const updateObservables = this.selectedUsers.map(userId => {
      const userData: Partial<User> = {};

      if (action.type === 'role') {
        userData.role = action.value;
      } else if (action.type === 'status') {
        userData.subscription_status = action.value;
      }

      return this.userService.updateUser(userId, userData);
    });

    // Use forkJoin to execute all update operations in parallel
    import('rxjs').then(({ forkJoin }) => {
      forkJoin(updateObservables).subscribe({
        next: (updatedUsers) => {
          // Update the users in the local array
          updatedUsers.forEach(updatedUser => {
            const index = this.users.findIndex(u => u.id === updatedUser.id);
            if (index !== -1) {
              this.users[index] = {
                ...this.users[index],
                ...updatedUser
              };
            }
          });

          this.isLoading = false;
          this.showBulkActionDialog = false;
          this.selectedUsers = [];
        },
        error: (error) => {
          console.error('Error updating users:', error);
          this.isLoading = false;
          this.errorMessage = 'Failed to update some users. Please try again.';
          this.showBulkActionDialog = false;
        }
      });
    });
  }

  confirmBulkDelete(): void {
    if (confirm(`Are you sure you want to delete ${this.selectedUsers.length} users? This action cannot be undone.`)) {
      this.isDeleting = true;

      // Create an array of observables for each delete operation
      const deleteObservables = this.selectedUsers.map(userId =>
        this.userService.deleteUser(userId)
      );

      // Use forkJoin to execute all delete operations in parallel
      import('rxjs').then(({ forkJoin }) => {
        forkJoin(deleteObservables).subscribe({
          next: () => {
            // Remove the deleted users from the local array
            this.users = this.users.filter(u => !this.selectedUsers.includes(u.id));
            this.selectedUsers = [];
            this.isDeleting = false;
          },
          error: (error) => {
            console.error('Error deleting users:', error);
            this.isDeleting = false;
            this.errorMessage = 'Failed to delete some users. Please try again.';
          }
        });
      });
    }
  }

  // Export functionality
  exportUserData(format: string): void {
    this.isExporting = true;

    // Apply the same filters as the current view
    const filters = {
      role: this.selectedRole !== 'all' ? this.selectedRole : undefined,
      status: this.selectedStatus !== 'all' ? this.selectedStatus : undefined,
      tier: this.selectedTier !== 'all' ? this.selectedTier : undefined,
      searchTerm: this.searchTerm || undefined,
      dateFilter: this.dateFilter !== 'all' ? this.dateFilter : undefined
    };

    // Get all users matching the current filters
    this.userService.getAllUsers(filters).subscribe({
      next: (users) => {
        if (format === 'csv') {
          this.downloadCSV(users);
        } else if (format === 'json') {
          this.downloadJSON(users);
        }
        this.isExporting = false;
      },
      error: (error) => {
        console.error('Error exporting users:', error);
        this.isExporting = false;
        this.errorMessage = 'Failed to export users. Please try again.';
      }
    });
  }

  downloadCSV(users: User[]): void {
    // Create CSV content
    const headers = ['ID', 'Name', 'Email', 'Role', 'Organization', 'Subscription', 'Status', 'Created', 'Last Active'];
    const csvRows = [
      headers.join(','),
      ...users.map(user => [
        user.id,
        `"${user.full_name || 'N/A'}"`,
        user.email,
        user.role,
        `"${user.organization_name || 'N/A'}"`,
        user.subscription_tier || 'N/A',
        user.subscription_status || 'N/A',
        new Date(user.created_at).toLocaleDateString(),
        user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    this.downloadFile(csvContent, 'users.csv', 'text/csv');
  }

  downloadJSON(users: User[]): void {
    const jsonContent = JSON.stringify(users, null, 2);
    this.downloadFile(jsonContent, 'users.json', 'application/json');
  }

  downloadFile(content: string, fileName: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
