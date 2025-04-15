import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-bulk-action-dialog',
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">{{ title }}</h2>
          <button (click)="onCancel()" class="text-gray-500 hover:text-gray-700">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Error message -->
        <div *ngIf="errorMessage" class="mb-4 bg-red-50 text-red-600 p-3 rounded-lg flex items-center">
          <span class="material-icons mr-2">error</span>
          {{ errorMessage }}
        </div>

        <form [formGroup]="actionForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div *ngIf="actionType === 'role'">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select 
              formControlName="role"
              class="w-full rounded-md border-gray-300"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div *ngIf="actionType === 'status'">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Subscription Status
            </label>
            <select 
              formControlName="status"
              class="w-full rounded-md border-gray-300"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div class="mt-2 text-sm text-gray-500">
            This action will be applied to {{ userCount }} selected users.
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
              [disabled]="actionForm.invalid || isSubmitting"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              [class.opacity-50]="actionForm.invalid || isSubmitting"
            >
              <span *ngIf="isSubmitting" class="material-icons animate-spin mr-1 text-sm">refresh</span>
              {{ isSubmitting ? 'Applying...' : 'Apply' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class BulkActionDialogComponent implements OnInit {
  @Input() actionType: 'role' | 'status' = 'role';
  @Input() userCount: number = 0;
  @Output() close = new EventEmitter<void>();
  @Output() applyAction = new EventEmitter<{type: string, value: string}>();
  
  actionForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  get title(): string {
    return this.actionType === 'role' ? 'Change Role' : 'Change Subscription Status';
  }

  constructor(private fb: FormBuilder) {
    this.actionForm = this.fb.group({
      role: ['user', this.actionType === 'role' ? Validators.required : null],
      status: ['active', this.actionType === 'status' ? Validators.required : null]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.actionForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const value = this.actionType === 'role' 
      ? this.actionForm.value.role 
      : this.actionForm.value.status;

    this.applyAction.emit({
      type: this.actionType,
      value: value
    });
  }

  onCancel(): void {
    this.close.emit();
  }
}
