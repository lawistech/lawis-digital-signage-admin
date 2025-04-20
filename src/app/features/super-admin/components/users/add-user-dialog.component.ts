import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserManagementService, Organization } from '../../services/user-management.service';

@Component({
  selector: 'app-add-user-dialog',
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <!-- Header with improved styling - fixed at top -->
        <div class="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <div class="flex items-center">
            <span class="material-icons text-blue-600 mr-2">person_add</span>
            <h2 class="text-xl font-bold text-gray-800">Add New User</h2>
          </div>
          <button (click)="onCancel()" class="text-gray-500 hover:text-gray-700 transition-colors">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Scrollable content area -->
        <div class="overflow-y-auto p-6 pt-0">
          <!-- Error message -->
          <div *ngIf="errorMessage" class="mb-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center border-l-4 border-red-500 shadow-sm">
            <span class="material-icons mr-3 text-red-500">error</span>
            <span>{{ errorMessage }}</span>
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
              [class.border-red-500]="userForm.get('email')?.invalid && userForm.get('email')?.touched"
            >
            <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="text-red-500 text-sm mt-1">
              Valid email is required
            </div>
          </div>

          <!-- Note about user creation -->
          <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <span class="material-icons text-yellow-400">info</span>
              </div>
              <div class="ml-3">
                <p class="text-sm text-yellow-700">
                  Note: This user will be created as a profile only. They will need to use the "Forgot Password" feature to set a password and log in.
                </p>
              </div>
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
                {{ isSubmitting ? 'Creating...' : 'Create User' }}
              </div>
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  `
})
export class AddUserDialogComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() userCreated = new EventEmitter<any>();

  userForm: FormGroup;
  organizations: Organization[] = [];
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserManagementService
  ) {
    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['user', Validators.required],
      organizationId: [null]
    });
  }

  ngOnInit(): void {
    this.loadOrganizations();
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

    const userData = {
      email: this.userForm.value.email,
      full_name: this.userForm.value.fullName,
      role: this.userForm.value.role,
      organization_id: this.userForm.value.organizationId
    };

    console.log('AddUserDialog: Submitting user data');

    this.userService.createUser(userData).subscribe({
      next: (user) => {
        console.log('AddUserDialog: User created successfully', user.id);
        this.isSubmitting = false;

        // Show a success message
        alert(`User ${userData.full_name} (${userData.email}) has been created successfully.`);

        // Emit the user and close the dialog
        this.userCreated.emit(user);
        this.close.emit();
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('AddUserDialog: Error creating user:', error);
        this.errorMessage = error.message || 'Failed to create user. Please try again.';

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
}
