import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SubscriptionPlan } from '../../services/super-admin-stats.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-edit-plan-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatIconModule
  ],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-slate-800">{{ isNewPlan ? 'Add New Plan' : 'Edit Plan' }}</h2>
        <button (click)="close()" class="text-slate-400 hover:text-slate-600">
          <span class="material-icons">close</span>
        </button>
      </div>

      <form [formGroup]="planForm" (ngSubmit)="save()" class="space-y-4">
        <!-- Plan Name -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Plan Name</label>
          <input
            type="text"
            formControlName="name"
            class="w-full rounded-md border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm"
            placeholder="e.g., Basic, Standard, Premium"
          >
          <div *ngIf="planForm.get('name')?.invalid && planForm.get('name')?.touched" class="text-red-500 text-sm mt-1">
            Plan name is required
          </div>
        </div>

        <!-- Price -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Price (£/month)</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-slate-500">£</span>
            </div>
            <input
              type="number"
              formControlName="price"
              class="w-full pl-8 rounded-md border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm"
              placeholder="29.99"
              step="0.01"
              min="0"
            >
          </div>
          <div *ngIf="planForm.get('price')?.invalid && planForm.get('price')?.touched" class="text-red-500 text-sm mt-1">
            Valid price is required
          </div>
        </div>

        <!-- Max Screens -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Maximum Screens</label>
          <input
            type="number"
            formControlName="maxScreens"
            class="w-full rounded-md border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm"
            placeholder="5"
            min="1"
          >
          <div *ngIf="planForm.get('maxScreens')?.invalid && planForm.get('maxScreens')?.touched" class="text-red-500 text-sm mt-1">
            Valid number of screens is required
          </div>
        </div>

        <!-- Max Users -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Maximum Users</label>
          <input
            type="number"
            formControlName="maxUsers"
            class="w-full rounded-md border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm"
            placeholder="10"
            min="1"
          >
          <div *ngIf="planForm.get('maxUsers')?.invalid && planForm.get('maxUsers')?.touched" class="text-red-500 text-sm mt-1">
            Valid number of users is required
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            formControlName="description"
            class="w-full rounded-md border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm"
            placeholder="Brief description of the plan"
            rows="2"
          ></textarea>
        </div>

        <!-- Features -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-medium text-slate-700">Features</label>
            <button
              type="button"
              (click)="addFeature()"
              class="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
            >
              <span class="material-icons text-sm mr-1">add_circle</span>
              Add Feature
            </button>
          </div>

          <div formArrayName="features" class="space-y-2">
            <div *ngFor="let feature of featuresArray.controls; let i = index" class="flex items-center">
              <input
                [formControlName]="i"
                class="flex-1 rounded-md border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm"
                placeholder="e.g., Advanced scheduling"
              >
              <button
                type="button"
                (click)="removeFeature(i)"
                class="ml-2 text-red-500 hover:text-red-700"
              >
                <span class="material-icons">delete</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Popular Plan -->
        <div class="flex items-center">
          <input
            type="checkbox"
            id="isPopular"
            formControlName="isPopular"
            class="rounded border-slate-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
          <label for="isPopular" class="ml-2 block text-sm text-slate-700">
            Mark as Popular Plan
          </label>
        </div>

        <!-- Active Plan -->
        <div class="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            formControlName="isActive"
            class="rounded border-slate-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
          <label for="isActive" class="ml-2 block text-sm text-slate-700">
            Plan is Active
          </label>
        </div>

        <!-- Buttons -->
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            (click)="close()"
            class="px-4 py-2 border border-slate-300 rounded-md text-slate-700 bg-white hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="planForm.invalid || isSaving"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            [ngClass]="{'opacity-70 cursor-not-allowed': planForm.invalid || isSaving}"
          >
            <span *ngIf="isSaving" class="material-icons animate-spin mr-2 text-sm">autorenew</span>
            {{ isSaving ? 'Saving...' : 'Save Plan' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class EditPlanDialogComponent implements OnInit {
  planForm: FormGroup;
  isNewPlan: boolean;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditPlanDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { plan: SubscriptionPlan }
  ) {
    this.isNewPlan = !data.plan || !data.plan.id;

    this.planForm = this.fb.group({
      name: [data.plan?.name || '', Validators.required],
      price: [data.plan?.price || 0, [Validators.required, Validators.min(0)]],
      maxScreens: [data.plan?.max_screens || 1, [Validators.required, Validators.min(1)]],
      maxUsers: [data.plan?.max_users || 1, [Validators.required, Validators.min(1)]],
      description: [data.plan?.description || ''],
      features: this.fb.array([]),
      isPopular: [data.plan?.is_popular || false],
      isActive: [data.plan?.is_active !== false] // Default to true if not specified
    });

    // Add existing features
    if (data.plan?.features && data.plan.features.length > 0) {
      data.plan.features.forEach(feature => {
        this.addFeature(feature);
      });
    }
  }

  ngOnInit(): void {
    // If no features were added in constructor, add an empty one
    if (this.featuresArray.length === 0) {
      this.addFeature();
    }
  }

  get featuresArray() {
    return this.planForm.get('features') as FormArray;
  }

  addFeature(value: string = '') {
    this.featuresArray.push(this.fb.control(value));
  }

  removeFeature(index: number) {
    this.featuresArray.removeAt(index);
  }

  save() {
    if (this.planForm.invalid) return;

    this.isSaving = true;

    // Filter out empty features
    const features = this.featuresArray.value.filter((f: string) => f.trim() !== '');

    const planData: Partial<SubscriptionPlan> = {
      name: this.planForm.value.name,
      price: this.planForm.value.price,
      max_screens: this.planForm.value.maxScreens,
      max_users: this.planForm.value.maxUsers,
      description: this.planForm.value.description,
      features: features,
      is_popular: this.planForm.value.isPopular,
      is_active: this.planForm.value.isActive
    };

    // If editing, include the ID
    if (!this.isNewPlan && this.data.plan.id) {
      planData.id = this.data.plan.id;
    }

    this.dialogRef.close(planData);
  }

  close() {
    this.dialogRef.close();
  }
}
