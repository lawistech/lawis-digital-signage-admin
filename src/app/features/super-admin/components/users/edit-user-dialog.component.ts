import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserManagementService, User } from '../../services/user-management.service';

@Component({
  selector: 'app-edit-user-dialog',
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <!-- Header with improved styling - fixed at top -->
        <div class="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <div class="flex items-center">
            <span class="material-icons text-blue-600 mr-2">person</span>
            <h2 class="text-xl font-bold text-gray-800">Edit User</h2>
          </div>
          <button (click)="onCancel()" class="text-gray-500 hover:text-gray-700 transition-colors">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Scrollable content area -->
        <div class="overflow-y-auto p-6 pt-0">
          <!-- Status messages with improved styling -->
          <div *ngIf="errorMessage" class="mb-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center border-l-4 border-red-500 shadow-sm">
            <span class="material-icons mr-3 text-red-500">error</span>
            <span>{{ errorMessage }}</span>
          </div>

          <div *ngIf="successMessage" class="mb-6 bg-green-50 text-green-600 p-4 rounded-lg flex items-center border-l-4 border-green-500 shadow-sm">
            <span class="material-icons mr-3 text-green-500">check_circle</span>
            <span>{{ successMessage }}</span>
          </div>

          <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Two-column layout for basic info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Left column - Basic Info -->
            <div class="space-y-4">
              <h3 class="text-md font-medium text-gray-800 border-b pb-2">Basic Information</h3>

              <!-- Full Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  formControlName="fullName"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all"
                  [class.border-red-500]="userForm.get('fullName')?.invalid && userForm.get('fullName')?.touched"
                >
                <div *ngIf="userForm.get('fullName')?.invalid && userForm.get('fullName')?.touched" class="text-red-500 text-sm mt-1">
                  Full name is required
                </div>
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  formControlName="email"
                  class="w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                  [disabled]="true"
                >
                <div class="text-xs text-gray-500 mt-1 flex items-center">
                  <span class="material-icons text-xs mr-1">info</span>
                  Email cannot be changed
                </div>
              </div>

              <!-- Role -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  formControlName="role"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all"
                  [class.border-red-500]="userForm.get('role')?.invalid && userForm.get('role')?.touched"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <div *ngIf="userForm.get('role')?.invalid && userForm.get('role')?.touched" class="text-red-500 text-sm mt-1">
                  Role is required
                </div>
              </div>
            </div>

            <!-- Right column - Subscription Management -->
            <div class="space-y-4">
              <h3 class="text-md font-medium text-gray-800 border-b pb-2">Subscription Management</h3>

              <!-- Subscription Tier -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Subscription Tier</label>
                <select
                  formControlName="subscriptionTier"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all"
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <!-- Subscription Status -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Subscription Status</label>
                <select
                  formControlName="subscriptionStatus"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <!-- Resource Limits -->
              <div class="grid grid-cols-2 gap-4 mt-4">
                <!-- Max Screens -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Max Screens</label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <span class="material-icons text-sm">desktop_windows</span>
                    </span>
                    <input
                      type="number"
                      formControlName="maxScreens"
                      class="w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all"
                      min="1"
                      max="100"
                    >
                  </div>
                </div>

                <!-- Max Storage (GB) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Max Storage (GB)</label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <span class="material-icons text-sm">storage</span>
                    </span>
                    <input
                      type="number"
                      formControlName="maxStorage"
                      class="w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all"
                      min="1"
                      max="1000"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- User Stats (Read-only) with improved styling -->
          <div class="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-md font-medium text-gray-800 mb-4 flex items-center">
              <span class="material-icons text-blue-600 mr-2">analytics</span>
              Current Usage
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Screen Usage with Progress Bar -->
              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div class="flex justify-between items-center mb-2">
                  <div class="flex items-center">
                    <span class="material-icons text-blue-600 mr-2">desktop_windows</span>
                    <span class="font-medium text-gray-700">Screen Usage</span>
                  </div>
                  <span class="text-sm font-medium">{{ user.screen_count || 0 }}/{{ user.max_screens || 1 }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full transition-all duration-500"
                       [style.width.%]="getPercentage(user.screen_count || 0, user.max_screens || 1)"></div>
                </div>
              </div>

              <!-- Storage Usage with Progress Bar -->
              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div class="flex justify-between items-center mb-2">
                  <div class="flex items-center">
                    <span class="material-icons text-purple-600 mr-2">storage</span>
                    <span class="font-medium text-gray-700">Storage Usage</span>
                  </div>
                  <span class="text-sm font-medium">{{ formatStorage(user.storage_usage) }}/{{ formatStorage(user.max_storage) }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-purple-600 h-2 rounded-full transition-all duration-500"
                       [style.width.%]="getPercentage(user.storage_usage || 0, user.max_storage || 1)"></div>
                </div>
              </div>

              <!-- Last Active -->
              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
                <span class="material-icons text-blue-500 mr-3">access_time</span>
                <div>
                  <div class="text-sm font-medium text-gray-700">Last Active</div>
                  <div class="text-sm">{{ formatDate(user.last_sign_in_at) }}</div>
                </div>
              </div>

              <!-- Last Active Screen -->
              <div *ngIf="user.last_active_screen" class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
                <span class="material-icons text-blue-500 mr-3">monitor</span>
                <div>
                  <div class="text-sm font-medium text-gray-700">Last Active Screen</div>
                  <div class="text-sm">{{ user.last_active_screen }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action buttons with improved styling -->
          <div class="flex justify-end space-x-3 pt-4 mt-4 border-t bg-white pb-2">
            <button
              type="button"
              (click)="onCancel()"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="userForm.invalid || isSubmitting"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              [class.opacity-50]="userForm.invalid || isSubmitting"
            >
              <div class="flex items-center">
                <span *ngIf="isSubmitting" class="material-icons animate-spin mr-2 text-sm">refresh</span>
                {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
              </div>
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  `
})
export class EditUserDialogComponent implements OnInit {
  @Input() user!: User;
  @Output() close = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<User>();

  userForm!: FormGroup;

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserManagementService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      fullName: [this.user.full_name, Validators.required],
      email: [this.user.email],
      role: [this.user.role, Validators.required],
      subscriptionTier: [this.user.subscription_tier || 'free'],
      subscriptionStatus: [this.user.subscription_status || 'inactive'],
      maxScreens: [this.user.max_screens || 1, [Validators.required, Validators.min(1), Validators.max(100)]],
      maxStorage: [this.convertBytesToGB(this.user.max_storage || 5242880), [Validators.required, Validators.min(1), Validators.max(1000)]]
    });
  }

  getPercentage(current: number, max: number): number {
    if (max === 0) return 0;
    return Math.min(Math.round((current / max) * 100), 100);
  }

  convertBytesToGB(bytes: number): number {
    return Math.round(bytes / (1024 * 1024 * 1024));
  }

  convertGBToBytes(gb: number): number {
    return gb * 1024 * 1024 * 1024;
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      // Mark all form controls as touched to show validation errors
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Create the user data object from form values
    const userData: Partial<User> = {
      full_name: this.userForm.value.fullName,
      role: this.userForm.value.role,
      subscription_tier: this.userForm.value.subscriptionTier,
      subscription_status: this.userForm.value.subscriptionStatus,
      max_screens: this.userForm.value.maxScreens,
      max_storage: this.convertGBToBytes(this.userForm.value.maxStorage)
    };

    // Call the service to update the user
    this.userService.updateUser(this.user.id, userData).subscribe({
      next: (updatedUser) => {
        this.isSubmitting = false;
        this.successMessage = 'User updated successfully!';

        // Create a complete user object by merging the updated user with the original user
        // and the form data for fields that might not be returned by the API
        const completeUser: User = {
          ...this.user,
          full_name: updatedUser.full_name || this.user.full_name,
          role: updatedUser.role || this.user.role,
          // Use the updated values from the form for subscription and resource info
          subscription_tier: userData.subscription_tier || this.user.subscription_tier,
          subscription_status: userData.subscription_status || this.user.subscription_status,
          max_screens: userData.max_screens || this.user.max_screens,
          max_storage: userData.max_storage || this.user.max_storage
        };

        // Emit the updated user to the parent component
        this.userUpdated.emit(completeUser);

        // Close the dialog after a short delay to show the success message
        setTimeout(() => {
          this.close.emit();
        }, 1500);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error updating user:', error);
        // Show a user-friendly error message
        this.errorMessage = error.message || 'Failed to update user. Please try again.';

        // Scroll to the top of the form to show the error message
        const contentElement = document.querySelector('.overflow-y-auto');
        if (contentElement) {
          contentElement.scrollTop = 0;
        }
      }
    });
  }

  onCancel(): void {
    this.close.emit();
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

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}
