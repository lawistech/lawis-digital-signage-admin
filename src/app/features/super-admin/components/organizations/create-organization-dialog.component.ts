import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrganizationService } from '../../../../core/services/organization.service';

@Component({
  selector: 'app-create-organization-dialog',
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" *ngIf="isVisible">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Create New Organization</h2>
          <button (click)="cancel()" class="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
            <input type="text" id="name" formControlName="name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <div *ngIf="form.get('name')?.invalid && form.get('name')?.touched" class="text-red-500 text-sm mt-1">
              Organization name is required
            </div>
          </div>

          <div class="mb-4">
            <label for="subscriptionTier" class="block text-sm font-medium text-gray-700 mb-1">Subscription Tier</label>
            <select id="subscriptionTier" formControlName="subscriptionTier"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Basic">Basic</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label for="maxUsers" class="block text-sm font-medium text-gray-700 mb-1">Max Users</label>
              <input type="number" id="maxUsers" formControlName="maxUsers" min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label for="maxScreens" class="block text-sm font-medium text-gray-700 mb-1">Max Screens</label>
              <input type="number" id="maxScreens" formControlName="maxScreens" min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>

          <div class="mb-4">
            <label for="subscriptionStatus" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select id="subscriptionStatus" formControlName="subscriptionStatus"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" (click)="cancel()"
                   class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" [disabled]="form.invalid || isSubmitting"
                   class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              <span *ngIf="isSubmitting" class="inline-block animate-spin mr-2">⟳</span>
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CreateOrganizationDialogComponent {
  @Output() created = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  isVisible = false;
  isSubmitting = false;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private orgService: OrganizationService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      subscriptionTier: ['Standard', [Validators.required]],
      maxUsers: [10, [Validators.required, Validators.min(1)]],
      maxScreens: [25, [Validators.required, Validators.min(1)]],
      subscriptionStatus: ['active', [Validators.required]]
    });
  }

  show() {
    this.isVisible = true;
  }

  hide() {
    this.isVisible = false;
    this.form.reset({
      subscriptionTier: 'Standard',
      maxUsers: 10,
      maxScreens: 25,
      subscriptionStatus: 'active'
    });
  }

  cancel() {
    this.hide();
    this.cancelled.emit();
  }

  submit() {
    if (this.form.invalid) return;

    this.isSubmitting = true;

    this.orgService.createOrganization(this.form.value).subscribe({
      next: (org) => {
        this.created.emit(org);
        this.hide();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating organization:', error);
        this.isSubmitting = false;
        // In a real app, you would show an error message to the user
      }
    });
  }
}
