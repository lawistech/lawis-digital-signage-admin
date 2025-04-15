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

          <!-- User Stats (Read-only) -->
          <div *ngIf="user.organization_id" class="bg-gray-50 p-4 rounded-lg mt-2">
            <h3 class="text-sm font-medium text-gray-700 mb-2">User Resources</h3>

            <div class="grid grid-cols-2 gap-4">
              <!-- Subscription Info -->
              <div>
                <div class="text-xs text-gray-500">Subscription</div>
                <div class="flex items-center mt-1">
                  <span class="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full"
                        [ngClass]="{
                          'bg-green-100 text-green-800': user.subscription_status === 'active',
                          'bg-yellow-100 text-yellow-800': user.subscription_status === 'pending',
                          'bg-red-100 text-red-800': user.subscription_status === 'inactive'
                        }">
                    {{ user.subscription_tier | titlecase }}
                  </span>
                </div>
              </div>

              <!-- Screen Usage -->
              <div>
                <div class="text-xs text-gray-500">Screen Usage</div>
                <div class="flex items-center mt-1">
                  <span class="material-icons text-xs mr-1 text-blue-500">desktop_windows</span>
                  <span class="text-sm">{{ user.screen_count || 0 }}/{{ user.max_screens || 1 }}</span>
                </div>
              </div>

              <!-- Storage Usage -->
              <div>
                <div class="text-xs text-gray-500">Storage Usage</div>
                <div class="flex items-center mt-1">
                  <span class="material-icons text-xs mr-1 text-blue-500">storage</span>
                  <span class="text-sm">{{ formatStorage(user.storage_usage) }}/{{ formatStorage(user.max_storage) }}</span>
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
      organizationId: [this.user.organization_id]
    });
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
      organization_id: this.userForm.value.organizationId
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
          organization_id: updatedUser.organization_id
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
