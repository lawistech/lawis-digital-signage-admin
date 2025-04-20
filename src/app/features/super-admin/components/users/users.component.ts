import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { UserManagementService, User } from '../../services/user-management.service';
import { Subscription, filter } from 'rxjs';
import { SubscriptionPlan } from '../../services/super-admin-stats.service';

@Component({
  selector: 'app-users',
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">User Management</h1>
          <p class="text-sm text-slate-500 mt-1">Manage users and their subscriptions</p>
        </div>
        <div class="flex space-x-3">
          <!-- Export dropdown -->
          <div class="relative">
            <button
              (click)="showExportMenu = !showExportMenu"
              class="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 flex items-center transition-colors duration-200 shadow-sm"
              [disabled]="isExporting"
              [class.opacity-70]="isExporting"
            >
              <span class="material-icons text-sm mr-2">download</span>
              {{ isExporting ? 'Exporting...' : 'Export' }}
            </button>
            <div *ngIf="showExportMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-slate-200 overflow-hidden">
              <div class="py-1">
                <button
                  (click)="exportUserData('csv'); showExportMenu = false"
                  class="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-150"
                >
                  <div class="flex items-center">
                    <span class="material-icons text-emerald-500 mr-2 text-sm">description</span>
                    Export as CSV
                  </div>
                </button>
                <button
                  (click)="exportUserData('json'); showExportMenu = false"
                  class="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-150"
                >
                  <div class="flex items-center">
                    <span class="material-icons text-emerald-500 mr-2 text-sm">code</span>
                    Export as JSON
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Add user button -->
          <button
            (click)="showAddUserDialog = true"
            class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center transition-colors duration-200 shadow-sm"
          >
            <span class="material-icons text-sm mr-2">person_add</span>
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

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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

              <!-- Payment Status filter -->
              <div class="relative">
                <select
                  class="appearance-none pl-3 pr-8 py-2 border border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md text-sm text-slate-700 bg-white"
                  [(ngModel)]="selectedPaymentStatus"
                  (change)="loadUsers()"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <span class="material-icons text-slate-400 text-sm">expand_more</span>
                </div>
              </div>

              <!-- Subscription Status filter -->
              <div class="relative">
                <select
                  class="appearance-none pl-3 pr-8 py-2 border border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md text-sm text-slate-700 bg-white"
                  [(ngModel)]="selectedStatus"
                  (change)="loadUsers()"
                >
                  <option value="all">All Subscription Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <span class="material-icons text-slate-400 text-sm">expand_more</span>
                </div>
              </div>

              <!-- Subscription tier filter -->
              <div class="relative">
                <select
                  class="appearance-none pl-3 pr-8 py-2 border border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md text-sm text-slate-700 bg-white"
                  [(ngModel)]="selectedTier"
                  (change)="loadUsers()"
                >
                  <option value="all">All Tiers</option>
                  <option value="free">Free</option>
                  <option *ngFor="let plan of subscriptionPlans" [value]="plan.name">{{ plan.name }}</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <span class="material-icons text-slate-400 text-sm">expand_more</span>
                </div>
              </div>

              <!-- Date filter -->
              <div class="relative">
                <select
                  class="appearance-none pl-3 pr-8 py-2 border border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md text-sm text-slate-700 bg-white"
                  [(ngModel)]="dateFilter"
                  (change)="loadUsers()"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last Year</option>
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

        <!-- Bulk actions -->
        <div *ngIf="selectedUsers.length > 0" class="bg-indigo-50 p-5 border-b border-indigo-100 flex justify-between items-center">
          <div class="flex items-center">
            <div class="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
              <span class="material-icons text-sm">check_circle</span>
            </div>
            <div>
              <p class="text-sm font-medium text-indigo-800">
                <span class="font-bold">{{ selectedUsers.length }}</span> users selected
              </p>
              <p class="text-xs text-indigo-600">Select an action to perform on these users</p>
            </div>
          </div>
          <div class="flex space-x-3">
            <!-- Bulk actions dropdown -->
            <div class="relative">
              <button
                (click)="showBulkActionMenu = !showBulkActionMenu"
                class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm flex items-center transition-colors duration-200 shadow-sm"
              >
                <span class="material-icons text-sm mr-1">settings</span>
                Bulk Actions
                <span class="material-icons ml-1 text-sm">arrow_drop_down</span>
              </button>
              <div *ngIf="showBulkActionMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-slate-200 overflow-hidden">
                <div class="py-1">
                  <button
                    (click)="performBulkAction('changeRole'); showBulkActionMenu = false"
                    class="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-150"
                  >
                    <div class="flex items-center">
                      <span class="material-icons text-indigo-500 mr-2 text-sm">manage_accounts</span>
                      Change Role
                    </div>
                  </button>
                  <button
                    (click)="performBulkAction('changeStatus'); showBulkActionMenu = false"
                    class="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-150"
                  >
                    <div class="flex items-center">
                      <span class="material-icons text-indigo-500 mr-2 text-sm">toggle_on</span>
                      Change Status
                    </div>
                  </button>
                  <button
                    (click)="performBulkAction('changePayment'); showBulkActionMenu = false"
                    class="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-150"
                  >
                    <div class="flex items-center">
                      <span class="material-icons text-indigo-500 mr-2 text-sm">payments</span>
                      Change Payment Status
                    </div>
                  </button>
                  <div class="border-t border-slate-200 my-1"></div>

                </div>
              </div>
            </div>

            <!-- Cancel selection -->
            <button
              (click)="selectedUsers = []"
              class="px-4 py-2 border border-slate-300 rounded-md text-sm text-slate-700 hover:bg-slate-50 flex items-center transition-colors duration-150 shadow-sm"
            >
              <span class="material-icons text-sm mr-1">close</span>
              Cancel
            </button>
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

        <!-- Users table - Simplified and improved design -->
        <table *ngIf="!isLoading && !errorMessage" class="min-w-full divide-y divide-slate-200">
          <thead>
            <tr class="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              <th class="px-6 py-3">
                <div class="flex items-center">
                  <div class="relative flex items-center">
                    <input
                      type="checkbox"
                      class="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 mr-3"
                      [checked]="selectedUsers.length === users.length && users.length > 0"
                      (change)="selectAllUsers()"
                    >
                  </div>
                  <span class="font-semibold">User</span>
                </div>
              </th>
              <th class="px-6 py-3 font-semibold">Role</th>
              <th class="px-6 py-3 font-semibold">Status</th>
              <th class="px-6 py-3 font-semibold">Screens</th>
              <th class="px-6 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let user of users" class="hover:bg-gray-50 cursor-pointer" [class.bg-blue-50]="isUserSelected(user.id)" (click)="viewUserDetails(user)">
              <!-- User Info Column -->
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 rounded mr-2"
                    [checked]="isUserSelected(user.id)"
                    (change)="toggleUserSelection(user.id); $event.stopPropagation()"
                  >
                  <div class="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                    {{ getInitials(user.full_name || user.email) }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.full_name || 'N/A' }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                    <div class="text-xs text-gray-400 mt-1" [title]="'Created: ' + formatDate(user.created_at)">
                      Joined {{ getTimeAgo(user.created_at) }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Role Column -->
              <td class="px-6 py-4">
                <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="{
                        'bg-indigo-100 text-indigo-800': user.role === 'super_admin',
                        'bg-blue-100 text-blue-800': user.role === 'admin',
                        'bg-gray-100 text-gray-800': user.role === 'user'
                      }">
                  {{ user.role | titlecase }}
                </span>
              </td>

              <!-- Status Column (combines subscription and payment) -->
              <td class="px-6 py-4">
                <div class="flex flex-col space-y-2">
                  <!-- Subscription Status -->
                  <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                        [ngClass]="{
                          'bg-green-100 text-green-800': user.subscription_status === 'active',
                          'bg-yellow-100 text-yellow-800': user.subscription_status === 'pending',
                          'bg-red-100 text-red-800': user.subscription_status === 'inactive'
                        }"
                        [title]="'Renewal: ' + formatNextBillingDate(user.subscription_renewal_date)">
                    {{ user.subscription_tier | titlecase }}
                  </span>

                  <!-- Payment Status -->
                  <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                        [ngClass]="{
                          'bg-green-100 text-green-800': user.payment_status === 'paid',
                          'bg-yellow-100 text-yellow-800': user.payment_status === 'pending',
                          'bg-red-100 text-red-800': user.payment_status === 'failed'
                        }">
                    <span class="material-icons text-xs mr-1"
                          [ngClass]="{
                            'text-green-600': user.payment_status === 'paid',
                            'text-yellow-600': user.payment_status === 'pending',
                            'text-red-600': user.payment_status === 'failed'
                          }">payments</span>
                    {{ user.payment_status | titlecase }}
                  </span>
                </div>
              </td>

              <!-- Screens Column -->
              <td class="px-6 py-4">
                <div class="flex items-center" title="Screen Usage">
                  <span class="material-icons text-sm mr-2 text-blue-600">desktop_windows</span>
                  <span class="text-sm font-medium">{{ user.screen_count || 0 }}/{{ user.max_screens || 1 }}</span>
                </div>
              </td>

              <!-- Actions Column -->
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end space-x-3">
                  <button
                    (click)="editUser(user); $event.stopPropagation()"
                    class="text-blue-600 hover:text-blue-900 flex items-center"
                  >
                    <span class="material-icons text-sm">edit</span>
                  </button>
                  <button
                    (click)="viewUserDetails(user); $event.stopPropagation()"
                    class="text-indigo-600 hover:text-indigo-900 flex items-center"
                  >
                    <span class="material-icons text-sm">visibility</span>
                  </button>
                </div>
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

    <!-- User Details Dialog -->
    <app-user-details-dialog
      *ngIf="showUserDetailsDialog && selectedUser"
      [user]="selectedUser"
      (close)="showUserDetailsDialog = false"
      (edit)="onEditFromDetails()"
      (deleted)="onUserDeleted()"
    ></app-user-details-dialog>

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
export class UsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  isLoading = false;
  errorMessage = '';
  currentPage = 1;
  pageSize = 10;
  showAddUserDialog = false;
  showEditUserDialog = false;
  showUserDetailsDialog = false;

  searchTerm = '';
  selectedRole = 'all';
  selectedStatus = 'all';
  selectedPaymentStatus = 'all';
  selectedTier = 'all';
  dateFilter = 'all';
  totalUsers = 0;
  selectedUser: User | null = null;

  selectedUsers: string[] = [];
  showBulkActionMenu = false;
  showExportMenu = false;
  isExporting = false;
  showBulkActionDialog = false;
  bulkActionType: 'role' | 'status' | 'payment' = 'role';

  subscriptionPlans: SubscriptionPlan[] = [];

  private routerSubscription: Subscription | null = null;

  constructor(
    private userService: UserManagementService,
    private router: Router
  ) {}

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.selectedUsers = [];

    // Apply filters
    const filters = {
      role: this.selectedRole !== 'all' ? this.selectedRole : undefined,
      status: this.selectedStatus !== 'all' ? this.selectedStatus : undefined,
      paymentStatus: this.selectedPaymentStatus !== 'all' ? this.selectedPaymentStatus : undefined,
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
    // Initial data load
    this.loadUsers();
    this.loadSubscriptionPlans();

    // Subscribe to router events to reload data when navigating to this component
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Check if we're navigating to the users page
      if (event.url.includes('/super-admin/users')) {
        console.log('Navigation to users page detected, reloading data');
        this.loadUsers();
      }
    });

    // Listen for messages from other components
    window.addEventListener('message', this.handleWindowMessages.bind(this));
  }

  loadSubscriptionPlans(): void {
    this.userService.getSubscriptionPlans().subscribe({
      next: (plans) => {
        console.log('Loaded subscription plans:', plans);
        this.subscriptionPlans = plans.filter(plan => plan.is_active !== false);
      },
      error: (error) => {
        console.error('Error loading subscription plans:', error);
        // Return empty array instead of default plans
        this.subscriptionPlans = [];
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }

    // Remove event listener
    window.removeEventListener('message', this.handleWindowMessages.bind(this));
  }

  // Handle messages from other components
  handleWindowMessages(event: MessageEvent): void {
    // Check if the message is from our application
    if (event.data && event.data.action === 'openAddUserDialog') {
      console.log('Received message to open Add User dialog');
      this.showAddUserDialog = true;
    }
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedRole = 'all';
    this.selectedStatus = 'all';
    this.selectedPaymentStatus = 'all';
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

    // Instead of random values, use a deterministic approach based on the user's ID
    // This ensures consistent rendering and avoids ExpressionChangedAfterItHasBeenCheckedError
    const frequencies = ['Frequent', 'Regular', 'Occasional', 'Rare'];
    if (!user.id) return frequencies[0];

    // Use the last character of the user ID to determine frequency
    const lastChar = user.id.charAt(user.id.length - 1);
    const charCode = lastChar.charCodeAt(0);
    const index = charCode % frequencies.length;
    return frequencies[index];
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

  onUserCreated(user: User): void {
    console.log('UsersComponent: User created:', user);

    // Add the new user to the beginning of the list without reloading
    if (user && user.id) {
      console.log('UsersComponent: Adding new user to list');
      this.users = [user, ...this.users];

      // Also reload the list from the server to ensure we have the latest data
      setTimeout(() => {
        console.log('UsersComponent: Reloading users after user creation');
        this.loadUsers();
      }, 1000);
    } else {
      // Fallback to reloading if we don't have a valid user object
      this.loadUsers();
    }
  }

  editUser(user: User): void {
    this.selectedUser = user;
    this.showEditUserDialog = true;
    this.showUserDetailsDialog = false;
  }

  onUserUpdated(_: User): void {
    // Reload the users list to get the latest data from the server
    this.loadUsers();

    // Close the dialog
    this.showEditUserDialog = false;
    this.selectedUser = null;
  }

  viewUserDetails(user: User): void {
    this.selectedUser = user;
    this.showUserDetailsDialog = true;
  }

  onEditFromDetails(): void {
    // Keep the selected user but switch from details to edit dialog
    this.showUserDetailsDialog = false;
    this.showEditUserDialog = true;
  }

  onUserDeleted(): void {
    // Reload the users list after a user is deleted
    this.loadUsers();
    this.selectedUser = null;
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

      case 'changeRole':
        this.bulkActionType = 'role';
        this.showBulkActionDialog = true;
        break;
      case 'changeStatus':
        this.bulkActionType = 'status';
        this.showBulkActionDialog = true;
        break;
      case 'changePayment':
        this.bulkActionType = 'payment';
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
      } else if (action.type === 'payment') {
        userData.payment_status = action.value as 'paid' | 'pending' | 'failed';
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
