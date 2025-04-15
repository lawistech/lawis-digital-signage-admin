import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserManagementService, Organization } from '../../services/user-management.service';

@Component({
  selector: 'app-add-user-dialog',
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Add New User</h2>
          <button (click)="onCancel()" class="text-gray-500 hover:text-gray-700">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Error message -->
        <div *ngIf="errorMessage" class="mb-4 bg-red-50 text-red-600 p-3 rounded-lg flex items-center">
          <span class="material-icons mr-2">error</span>
          {{ errorMessage }}
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

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input 
              type="password" 
              formControlName="password"
              class="w-full rounded-md border-gray-300"
              [class.border-red-500]="userForm.get('password')?.invalid && userForm.get('password')?.touched"
            >
            <div *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched" class="text-red-500 text-sm mt-1">
              Password must be at least 6 characters
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
              {{ isSubmitting ? 'Creating...' : 'Create User' }}
            </button>
          </div>
        </form>
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
      password: ['', [Validators.required, Validators.minLength(6)]],
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
    if (this.userForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const userData = {
      email: this.userForm.value.email,
      password: this.userForm.value.password,
      full_name: this.userForm.value.fullName,
      role: this.userForm.value.role,
      organization_id: this.userForm.value.organizationId
    };

    this.userService.createUser(userData).subscribe({
      next: (user) => {
        this.isSubmitting = false;
        this.userCreated.emit(user);
        this.close.emit();
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error creating user:', error);
        this.errorMessage = error.message || 'Failed to create user. Please try again.';
      }
    });
  }

  onCancel(): void {
    this.close.emit();
  }
}
