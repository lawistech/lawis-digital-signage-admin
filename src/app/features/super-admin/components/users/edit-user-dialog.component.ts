import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserManagementService, User, Organization } from '../../services/user-management.service';

@Component({
  selector: 'app-edit-user-dialog',
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Edit User</h2>
          <button (click)="onCancel()" class="text-gray-500 hover:text-gray-700">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Error message -->
        <div *ngIf="errorMessage" class="mb-4 bg-red-50 text-red-600 p-3 rounded-lg flex items-center">
          <span class="material-icons mr-2">error</span>
          {{ errorMessage }}
        </div>

        <!-- Success message -->
        <div *ngIf="successMessage" class="mb-4 bg-green-50 text-green-600 p-3 rounded-lg flex items-center">
          <span class="material-icons mr-2">check_circle</span>
          {{ successMessage }}
        </div>

        <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              formControlName="fullName"
              class="w-full rounded-md border-gray-300"
              [class.border-red-500]="userForm.get('fullName')?.invalid && userForm.get('fullName')?.touched"
            >
            <div *ngIf="userForm.get('fullName')?.invalid && userForm.get('fullName')?.touched" class="text-red-500 text-sm mt-1">
              Full name is required
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              formControlName="email"
              class="w-full rounded-md border-gray-300"
              [disabled]="true"
            >
            <div class="text-xs text-gray-500 mt-1">
              Email cannot be changed
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              formControlName="role"
              class="w-full rounded-md border-gray-300"
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

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Organization
            </label>
            <select
              formControlName="organizationId"
              class="w-full rounded-md border-gray-300"
            >
              <option [value]="null">None</option>
              <option *ngFor="let org of organizations" [value]="org.id">{{ org.name }}</option>
            </select>
          </div>

          <!-- Subscription Management -->
          <div class="border-t mt-4 pt-4">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Subscription Management</h3>

            <div class="grid grid-cols-2 gap-4">
              <!-- Subscription Tier -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">Subscription Tier</label>
                <select
                  formControlName="subscriptionTier"
                  class="w-full rounded-md border-gray-300 text-sm"
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <!-- Subscription Status -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">Subscription Status</label>
                <select
                  formControlName="subscriptionStatus"
                  class="w-full rounded-md border-gray-300 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <!-- Max Screens -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">Max Screens</label>
                <input
                  type="number"
                  formControlName="maxScreens"
                  class="w-full rounded-md border-gray-300 text-sm"
                  min="1"
                  max="100"
                >
              </div>

              <!-- Max Storage (GB) -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">Max Storage (GB)</label>
                <input
                  type="number"
                  formControlName="maxStorage"
                  class="w-full rounded-md border-gray-300 text-sm"
                  min="1"
                  max="1000"
                >
              </div>
            </div>
          </div>

          <!-- User Stats (Read-only) -->
          <div class="bg-gray-50 p-4 rounded-lg mt-4">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Current Usage</h3>

            <div class="grid grid-cols-2 gap-4">
              <!-- Screen Usage with Progress Bar -->
              <div>
                <div class="text-xs text-gray-500 mb-1">Screen Usage</div>
                <div class="flex items-center mb-1">
                  <span class="material-icons text-xs mr-1 text-blue-600">desktop_windows</span>
                  <span class="text-xs text-gray-700 mr-2">{{ user.screen_count || 0 }}/{{ user.max_screens || 1 }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                  <div class="bg-blue-600 h-1.5 rounded-full"
                       [style.width.%]="getPercentage(user.screen_count || 0, user.max_screens || 1)"></div>
                </div>
              </div>

              <!-- Storage Usage with Progress Bar -->
              <div>
                <div class="text-xs text-gray-500 mb-1">Storage Usage</div>
                <div class="flex items-center mb-1">
                  <span class="material-icons text-xs mr-1 text-purple-600">storage</span>
                  <span class="text-xs text-gray-700 mr-2">{{ formatStorage(user.storage_usage) }}/{{ formatStorage(user.max_storage) }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                  <div class="bg-purple-600 h-1.5 rounded-full"
                       [style.width.%]="getPercentage(user.storage_usage || 0, user.max_storage || 1)"></div>
                </div>
              </div>

              <!-- Last Active -->
              <div>
                <div class="text-xs text-gray-500">Last Active</div>
                <div class="flex items-center mt-1">
                  <span class="material-icons text-xs mr-1 text-blue-500">access_time</span>
                  <span class="text-sm">{{ formatDate(user.last_sign_in_at) }}</span>
                </div>
              </div>

              <!-- Last Active Screen -->
              <div *ngIf="user.last_active_screen">
                <div class="text-xs text-gray-500">Last Active Screen</div>
                <div class="flex items-center mt-1">
                  <span class="material-icons text-xs mr-1 text-blue-500">monitor</span>
                  <span class="text-sm">{{ user.last_active_screen }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              (click)="onCancel()"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="userForm.invalid || isSubmitting"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              [class.opacity-50]="userForm.invalid || isSubmitting"
            >
              <span *ngIf="isSubmitting" class="material-icons animate-spin mr-1 text-sm">refresh</span>
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class EditUserDialogComponent implements OnInit {
  @Input() user!: User;
  @Output() close = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<User>();

  userForm!: FormGroup;
  organizations: Organization[] = [];
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserManagementService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadOrganizations();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      fullName: [this.user.full_name, Validators.required],
      email: [this.user.email],
      role: [this.user.role, Validators.required],
      organizationId: [this.user.organization_id],
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

  loadOrganizations(): void {
    this.userService.getOrganizations().subscribe({
      next: (orgs) => {
        this.organizations = orgs;
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
        this.errorMessage = 'Failed to load organizations. Some features may be limited.';
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const userData: Partial<User> = {
      full_name: this.userForm.value.fullName,
      role: this.userForm.value.role,
      organization_id: this.userForm.value.organizationId,
      subscription_tier: this.userForm.value.subscriptionTier,
      subscription_status: this.userForm.value.subscriptionStatus,
      max_screens: this.userForm.value.maxScreens,
      max_storage: this.convertGBToBytes(this.userForm.value.maxStorage)
    };

    this.userService.updateUser(this.user.id, userData).subscribe({
      next: (updatedUser) => {
        this.isSubmitting = false;
        this.successMessage = 'User updated successfully!';

        // Create a complete user object by merging the updated user with the original user
        const completeUser: User = {
          ...this.user,
          // Use the updated user's full_name (which might come from the 'name' field in the database)
          full_name: updatedUser.full_name,
          role: updatedUser.role,
          organization_id: updatedUser.organization_id,
          subscription_tier: userData.subscription_tier,
          subscription_status: userData.subscription_status,
          max_screens: userData.max_screens,
          max_storage: userData.max_storage
        };

        this.userUpdated.emit(completeUser);

        // Close the dialog after a short delay to show the success message
        setTimeout(() => {
          this.close.emit();
        }, 1500);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error updating user:', error);
        this.errorMessage = error.message || 'Failed to update user. Please try again.';
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
