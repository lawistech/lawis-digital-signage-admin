import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SuperAdminStatsService, SystemSettings, SubscriptionPlan } from '../../services/super-admin-stats.service';
import { EditPlanDialogComponent } from './edit-plan-dialog.component';

@Component({
  selector: 'app-settings',
  template: `
    <div class="space-y-8">
      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-bold text-slate-800">System Settings</h1>
        <p class="text-sm text-slate-500 mt-1">Configure platform-wide settings and preferences</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- General Settings -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden col-span-2">
          <div class="px-6 py-4 border-b border-slate-200 flex items-center">
            <span class="material-icons mr-2 text-indigo-600">settings</span>
            <h2 class="text-lg font-semibold text-slate-800">General Settings</h2>
          </div>
          <div class="p-6">
            <!-- Loading indicator -->
            <div *ngIf="isLoading" class="text-center py-6">
              <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600 mb-4"></div>
              <p class="text-slate-500 font-medium">Loading settings...</p>
            </div>

            <!-- Error message -->
            <div *ngIf="errorMessage" class="mb-6">
              <div class="bg-red-50 text-red-600 p-4 rounded-lg flex items-center border border-red-100">
                <span class="material-icons mr-2">error_outline</span>
                <span class="font-medium">{{ errorMessage }}</span>
              </div>
            </div>

            <!-- Success message -->
            <div *ngIf="successMessage" class="mb-6">
              <div class="bg-emerald-50 text-emerald-600 p-4 rounded-lg flex items-center border border-emerald-100">
                <span class="material-icons mr-2">check_circle</span>
                <span class="font-medium">{{ successMessage }}</span>
              </div>
            </div>

            <form [formGroup]="generalSettingsForm" (ngSubmit)="saveGeneralSettings()" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  System Name
                </label>
                <input
                  type="text"
                  formControlName="systemName"
                  class="w-full rounded-md border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm"
                  [disabled]="isLoading || isSaving"
                >
                <div *ngIf="generalSettingsForm.get('systemName')?.invalid && generalSettingsForm.get('systemName')?.touched" class="text-red-500 text-sm mt-2 flex items-center">
                  <span class="material-icons text-xs mr-1">error</span>
                  System name is required
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  Support Email
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="material-icons text-slate-400 text-sm">email</span>
                  </div>
                  <input
                    type="email"
                    formControlName="supportEmail"
                    class="w-full pl-10 rounded-md border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm"
                    [disabled]="isLoading || isSaving"
                  >
                </div>
                <div *ngIf="generalSettingsForm.get('supportEmail')?.invalid && generalSettingsForm.get('supportEmail')?.touched" class="text-red-500 text-sm mt-2 flex items-center">
                  <span class="material-icons text-xs mr-1">error</span>
                  Valid email address is required
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  Default Timezone
                </label>
                <div class="relative">
                  <select
                    formControlName="timezone"
                    class="appearance-none w-full pl-3 pr-10 py-2 rounded-md border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm"
                    [disabled]="isLoading || isSaving"
                  >
                    <option value="UTC">UTC</option>
                    <option value="Europe/London">London (GMT/BST)</option>
                    <option value="America/New_York">New York (EST/EDT)</option>
                    <option value="America/Los_Angeles">Los Angeles (PST/PDT)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span class="material-icons text-slate-400 text-sm">expand_more</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center py-2">
                <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    formControlName="maintenanceMode"
                    class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-slate-300 appearance-none cursor-pointer"
                    [disabled]="isLoading || isSaving"
                  />
                  <label
                    for="maintenanceMode"
                    class="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 cursor-pointer"
                  ></label>
                </div>
                <label for="maintenanceMode" class="text-sm font-medium text-slate-700">
                  Enable Maintenance Mode
                </label>
              </div>

              <div class="flex items-center space-x-3 pt-2">
                <button
                  type="submit"
                  class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center transition-colors duration-200 shadow-sm"
                  [disabled]="generalSettingsForm.invalid || generalSettingsForm.pristine || isLoading || isSaving"
                  [ngClass]="{'opacity-70 cursor-not-allowed': generalSettingsForm.invalid || generalSettingsForm.pristine || isLoading || isSaving}"
                >
                  <span *ngIf="isSaving" class="material-icons animate-spin mr-2 text-sm">autorenew</span>
                  <span *ngIf="!isSaving" class="material-icons mr-2 text-sm">save</span>
                  {{ isSaving ? 'Saving...' : 'Save Settings' }}
                </button>

                <button
                  type="button"
                  class="border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors duration-200 shadow-sm flex items-center"
                  [disabled]="isLoading || isSaving"
                  (click)="loadSettings()"
                >
                  <span class="material-icons mr-2 text-sm">refresh</span>
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Subscription Plans -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div class="flex items-center">
              <span class="material-icons mr-2 text-indigo-600">subscriptions</span>
              <h2 class="text-lg font-semibold text-slate-800">Subscription Plans</h2>
            </div>
            <button
              (click)="loadSubscriptionPlans()"
              class="text-indigo-600 hover:text-indigo-800 text-sm flex items-center transition-colors duration-150"
              [disabled]="isLoadingPlans"
            >
              <span class="material-icons text-sm mr-1" [class.animate-spin]="isLoadingPlans">{{ isLoadingPlans ? 'autorenew' : 'refresh' }}</span>
              {{ isLoadingPlans ? 'Loading...' : 'Refresh' }}
            </button>
          </div>
          <div class="p-6">
            <!-- Error message -->
            <div *ngIf="planErrorMessage" class="mb-6">
              <div class="bg-red-50 text-red-600 p-4 rounded-lg flex items-center border border-red-100">
                <span class="material-icons mr-2">error_outline</span>
                <span class="font-medium">{{ planErrorMessage }}</span>
              </div>
            </div>

            <!-- Success message -->
            <div *ngIf="planSuccessMessage" class="mb-6">
              <div class="bg-green-50 text-green-600 p-4 rounded-lg flex items-center border border-green-100">
                <span class="material-icons mr-2">check_circle</span>
                <span class="font-medium">{{ planSuccessMessage }}</span>
              </div>
            </div>

            <!-- Loading indicator -->
            <div *ngIf="isLoadingPlans && subscriptionPlans.length === 0" class="text-center py-6">
              <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600 mb-4"></div>
              <p class="text-slate-500 font-medium">Loading subscription plans...</p>
            </div>

            <div class="space-y-4" *ngIf="!isLoadingPlans || subscriptionPlans.length > 0">
              <div *ngFor="let plan of subscriptionPlans; let i = index"
                   class="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-300 relative overflow-hidden"
                   [ngClass]="{
                     'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200': plan.name === 'Basic',
                     'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200': plan.name === 'Standard',
                     'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200': plan.name === 'Premium',
                     'opacity-60': plan.is_active === false
                   }">
                <div class="absolute top-0 right-0 w-16 h-16 overflow-hidden" *ngIf="plan.is_popular">
                  <div class="absolute transform rotate-45 bg-indigo-600 text-white text-xs font-bold py-1 right-[-35px] top-[15px] w-[170px] text-center">POPULAR</div>
                </div>
                <div class="flex justify-between items-center">
                  <h3 class="font-bold text-slate-800 text-lg">{{ plan.name }}</h3>
                  <div class="flex space-x-2">
                    <button
                      (click)="openEditPlanDialog(plan)"
                      class="text-indigo-600 hover:text-indigo-800 text-sm flex items-center transition-colors duration-150"
                    >
                      <span class="material-icons text-sm mr-1">edit</span>
                      Edit
                    </button>
                    <button
                      *ngIf="plan.id"
                      (click)="deleteSubscriptionPlan(plan.id)"
                      class="text-red-600 hover:text-red-800 text-sm flex items-center transition-colors duration-150"
                    >
                      <span class="material-icons text-sm mr-1">delete</span>
                      Delete
                    </button>
                  </div>
                </div>
                <div class="mt-2 flex items-baseline">
                  <span class="text-2xl font-bold text-slate-800">£{{ plan.price }}</span>
                  <span class="text-slate-500 text-sm ml-1">/ month</span>
                </div>
                <div class="mt-4 space-y-2">
                  <div class="flex items-center text-sm text-slate-600">
                    <span class="material-icons text-indigo-500 mr-2 text-sm">desktop_windows</span>
                    <span>{{ plan.max_screens }} screens</span>
                  </div>
                  <div class="flex items-center text-sm text-slate-600">
                    <span class="material-icons text-indigo-500 mr-2 text-sm">people</span>
                    <span>{{ plan.max_users }} users</span>
                  </div>
                  <div *ngIf="plan.features && plan.features.length > 0" class="mt-3 pt-3 border-t border-slate-100">
                    <div class="text-xs text-slate-400 mb-2">{{ plan.features.length }} features</div>
                    <div *ngFor="let feature of plan.features" class="flex items-start text-sm text-slate-600 mt-2">
                      <span class="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                      <span>{{ feature }}</span>
                    </div>
                  </div>
                  <div *ngIf="!plan.features || plan.features.length === 0" class="mt-3 pt-3 border-t border-slate-100">
                    <div class="flex items-start text-sm text-slate-400 mt-2 italic">
                      <span class="material-icons text-slate-300 mr-2 text-sm">info</span>
                      <span>No features listed</span>
                    </div>
                  </div>
                  <div *ngIf="plan.is_active === false" class="mt-3 pt-3 border-t border-slate-100">
                    <div class="flex items-center text-sm text-amber-600">
                      <span class="material-icons text-amber-500 mr-2 text-sm">warning</span>
                      <span>This plan is inactive</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                (click)="openEditPlanDialog()"
                class="w-full border border-dashed border-slate-300 rounded-lg p-4 text-slate-500 hover:text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 transition-colors duration-200 flex items-center justify-center"
              >
                <span class="material-icons mr-2">add_circle_outline</span>
                Add New Plan
              </button>
            </div>
          </div>
        </div>

        <!-- Email Templates -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden col-span-2">
          <div class="px-6 py-4 border-b border-slate-200 flex items-center">
            <span class="material-icons mr-2 text-indigo-600">email</span>
            <h2 class="text-lg font-semibold text-slate-800">Email Templates</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div *ngFor="let template of emailTemplates"
                   class="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-300">
                <div class="flex justify-between items-center">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                      <span class="material-icons">{{ getEmailIcon(template.name) }}</span>
                    </div>
                    <h3 class="font-medium text-slate-800">{{ template.name }}</h3>
                  </div>
                  <button class="text-indigo-600 hover:text-indigo-800 text-sm flex items-center transition-colors duration-150">
                    <span class="material-icons text-sm mr-1">edit</span>
                    Edit
                  </button>
                </div>
                <p class="text-slate-500 text-sm mt-3 ml-13">{{ template.description }}</p>
              </div>

              <button class="border border-dashed border-slate-300 rounded-lg p-5 text-slate-500 hover:text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 transition-colors duration-200 flex items-center justify-center">
                <span class="material-icons mr-2">add_circle_outline</span>
                Add New Template
              </button>
            </div>
          </div>
        </div>

        <!-- System Logs -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <div class="flex items-center">
              <span class="material-icons mr-2 text-indigo-600">article</span>
              <h2 class="text-lg font-semibold text-slate-800">System Logs</h2>
            </div>
            <button class="text-sm text-indigo-600 hover:text-indigo-800 flex items-center transition-colors duration-150">
              <span>View All</span>
              <span class="material-icons text-sm ml-1">arrow_forward</span>
            </button>
          </div>
          <div class="p-4 max-h-96 overflow-y-auto">
            <div *ngFor="let log of systemLogs" class="py-3 border-b border-slate-100 last:border-0">
              <div class="flex items-start">
                <div class="h-8 w-8 rounded-full flex items-center justify-center mr-3"
                     [ngClass]="{
                       'bg-red-100 text-red-600': log.level === 'error',
                       'bg-amber-100 text-amber-600': log.level === 'warning',
                       'bg-blue-100 text-blue-600': log.level === 'info'
                     }">
                  <span class="material-icons text-sm">{{ getLogIcon(log.level) }}</span>
                </div>
                <div class="flex-1">
                  <p class="text-sm text-slate-800 font-medium">{{ log.message }}</p>
                  <p class="text-xs text-slate-500 mt-1 flex items-center">
                    <span class="material-icons text-xs mr-1">schedule</span>
                    {{ formatDate(log.timestamp) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  generalSettingsForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  isSaving = false;
  successMessage = '';

  subscriptionPlans: SubscriptionPlan[] = [];
  isLoadingPlans = false;
  planErrorMessage = '';
  planSuccessMessage = '';

  emailTemplates = [
    { name: 'Welcome Email', description: 'Sent to new users upon registration' },
    { name: 'Password Reset', description: 'Sent when a user requests a password reset' },
    { name: 'Invoice', description: 'Monthly invoice notification' },
    { name: 'Subscription Expiring', description: 'Warning before subscription expires' }
  ];

  systemLogs = [
    { level: 'error', message: 'Failed to process payment for organization XYZ', timestamp: '2023-05-15T14:30:00Z' },
    { level: 'warning', message: 'High CPU usage detected on server', timestamp: '2023-05-15T13:45:00Z' },
    { level: 'info', message: 'New organization registered: Acme Corp', timestamp: '2023-05-15T12:20:00Z' },
    { level: 'info', message: 'System backup completed successfully', timestamp: '2023-05-15T10:00:00Z' },
    { level: 'warning', message: 'Storage usage above 80%', timestamp: '2023-05-14T22:10:00Z' }
  ];

  constructor(
    private fb: FormBuilder,
    private statsService: SuperAdminStatsService,
    private dialog: MatDialog
  ) {
    this.generalSettingsForm = this.fb.group({
      systemName: ['Digital Signage Platform', Validators.required],
      supportEmail: ['support@example.com', [Validators.required, Validators.email]],
      timezone: ['Europe/London', Validators.required],
      maintenanceMode: [false]
    });
  }

  ngOnInit() {
    this.loadSettings();
    this.loadSubscriptionPlans();
  }

  loadSubscriptionPlans() {
    this.isLoadingPlans = true;
    this.planErrorMessage = '';
    console.log('Loading subscription plans...');

    this.statsService.getSubscriptionPlans().subscribe({
      next: (plans) => {
        console.log('Subscription plans loaded successfully:', plans);

        // Ensure plans is an array
        if (!plans || !Array.isArray(plans)) {
          console.warn('Unexpected format for subscription plans:', plans);
          this.subscriptionPlans = [];
        } else {
          // Process each plan to ensure all properties are properly formatted
          this.subscriptionPlans = plans.map(plan => {
            console.log(`Processing plan ${plan.name}, features:`, plan.features);
            console.log(`Features type: ${typeof plan.features}, isArray: ${Array.isArray(plan.features)}`);

            // Parse features if it's a string
            let features = [];
            if (typeof plan.features === 'string') {
              try {
                features = JSON.parse(plan.features);
                console.log('Parsed features from string:', features);
              } catch (e) {
                console.warn('Failed to parse features string:', plan.features);
              }
            } else if (Array.isArray(plan.features)) {
              features = plan.features;
              console.log('Features is already an array:', features);
            }

            return {
              id: plan.id,
              name: plan.name || 'Unnamed Plan',
              price: typeof plan.price === 'number' ? plan.price : parseFloat(plan.price) || 0,
              max_screens: typeof plan.max_screens === 'number' ? plan.max_screens : parseInt(plan.max_screens) || 0,
              max_users: typeof plan.max_users === 'number' ? plan.max_users : parseInt(plan.max_users) || 0,
              description: plan.description || '',
              features: features,
              is_popular: !!plan.is_popular,
              is_active: plan.is_active !== false,
              created_at: plan.created_at,
              updated_at: plan.updated_at
            };
          });
        }

        this.isLoadingPlans = false;
      },
      error: (error) => {
        console.error('Error loading subscription plans:', error);
        this.planErrorMessage = 'Failed to load subscription plans. Please try again.';
        this.isLoadingPlans = false;
      }
    });
  }

  openEditPlanDialog(plan?: SubscriptionPlan) {
    console.log('Opening edit plan dialog');
    console.log('Plan to edit:', plan);

    // Open the dialog using Angular Material
    const dialogRef = this.dialog.open(EditPlanDialogComponent, {
      width: '500px',
      data: { plan: plan || {} }
    });

    // Handle the dialog result
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        console.log('Dialog closed without saving');
        return;
      }

      console.log('Dialog result:', result);

      if (result.id) {
        // Update existing plan
        this.updateSubscriptionPlan(result.id, result);
      } else {
        // Add new plan
        this.addSubscriptionPlan(result);
      }
    });
  }

  updateSubscriptionPlan(planId: string, planData: Partial<SubscriptionPlan>) {
    this.isLoadingPlans = true;
    this.planErrorMessage = '';
    this.planSuccessMessage = '';

    this.statsService.updateSubscriptionPlan(planId, planData).subscribe({
      next: (updatedPlan) => {
        console.log('Plan updated successfully:', updatedPlan);
        // Update the plan in the local array
        const index = this.subscriptionPlans.findIndex(p => p.id === planId);
        if (index !== -1) {
          this.subscriptionPlans[index] = updatedPlan;
        }
        this.isLoadingPlans = false;
        this.planSuccessMessage = `Plan "${updatedPlan.name}" updated successfully!`;

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.planSuccessMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating subscription plan:', error);
        if (error.message === 'Not authorized') {
          this.planErrorMessage = 'Not authorized to update subscription plans. Please check the FIX-SUBSCRIPTION-PLANS.md file for solutions.';
        } else if (error.message.includes('COALESCE could not convert type')) {
          this.planErrorMessage = 'Type conversion error. Please check the FIX-SUBSCRIPTION-PLANS.md file for solutions.';
        } else {
          this.planErrorMessage = 'Failed to update subscription plan. Please try again.';
        }
        this.isLoadingPlans = false;
      }
    });
  }

  addSubscriptionPlan(planData: Partial<SubscriptionPlan>) {
    this.isLoadingPlans = true;
    this.planErrorMessage = '';
    this.planSuccessMessage = '';

    this.statsService.addSubscriptionPlan(planData).subscribe({
      next: (newPlan) => {
        console.log('Plan added successfully:', newPlan);
        // Add the new plan to the local array
        this.subscriptionPlans.push(newPlan);
        // Sort plans by price
        this.subscriptionPlans.sort((a, b) => a.price - b.price);
        this.isLoadingPlans = false;
        this.planSuccessMessage = `New plan "${newPlan.name}" added successfully!`;

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.planSuccessMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error adding subscription plan:', error);
        if (error.message === 'Not authorized') {
          this.planErrorMessage = 'Not authorized to add subscription plans. Please check the FIX-SUBSCRIPTION-PLANS.md file for solutions.';
        } else if (error.message.includes('COALESCE could not convert type')) {
          this.planErrorMessage = 'Type conversion error. Please check the FIX-SUBSCRIPTION-PLANS.md file for solutions.';
        } else {
          this.planErrorMessage = 'Failed to add subscription plan. Please try again.';
        }
        this.isLoadingPlans = false;
      }
    });
  }

  loadSettings() {
    this.isLoading = true;
    this.errorMessage = '';
    console.log('Loading settings...');

    this.statsService.getSystemSettings().subscribe({
      next: (settings: SystemSettings) => {
        console.log('Settings loaded successfully:', settings);
        this.generalSettingsForm.patchValue({
          systemName: settings.system_name,
          supportEmail: settings.support_email,
          timezone: settings.timezone,
          maintenanceMode: settings.maintenance_mode
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading settings in component:', error);
        this.errorMessage = 'Failed to load settings. Please try again.';
        this.isLoading = false;

        // Set default values in case of error
        this.generalSettingsForm.patchValue({
          systemName: 'Digital Signage Platform',
          supportEmail: 'support@example.com',
          timezone: 'Europe/London',
          maintenanceMode: false
        });
      }
    });
  }

  saveGeneralSettings() {
    if (this.generalSettingsForm.invalid) {
      console.warn('Form is invalid, cannot save settings');
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValues = this.generalSettingsForm.value;
    console.log('Form values to save:', formValues);

    // Map form values to the expected format
    const settings: Partial<SystemSettings> = {
      system_name: formValues.systemName,
      support_email: formValues.supportEmail,
      timezone: formValues.timezone,
      maintenance_mode: formValues.maintenanceMode
    };

    console.log('Saving settings:', settings);
    this.statsService.updateSystemSettings(settings).subscribe({
      next: (updatedSettings) => {
        console.log('Settings updated successfully:', updatedSettings);
        this.successMessage = 'Settings saved successfully!';
        this.generalSettingsForm.markAsPristine();
        this.isSaving = false;

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error saving settings:', error);
        this.errorMessage = 'Failed to save settings. Please try again. Error: ' + (error.message || 'Unknown error');
        this.isSaving = false;
      }
    });
  }

  // These methods are implemented below

  formatDate(dateString: string): string {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }

  getEmailIcon(templateName: string): string {
    switch (templateName.toLowerCase()) {
      case 'welcome email':
        return 'waving_hand';
      case 'password reset':
        return 'lock_reset';
      case 'invoice':
        return 'receipt';
      case 'subscription expiring':
        return 'timer';
      default:
        return 'email';
    }
  }

  getLogIcon(level: string): string {
    switch (level?.toLowerCase()) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }

  deleteSubscriptionPlan(planId: string) {
    // Find the plan name before deletion for the success message
    const planToDelete = this.subscriptionPlans.find(p => p.id === planId);
    const planName = planToDelete?.name || 'Unknown plan';

    if (!confirm(`Are you sure you want to delete the "${planName}" plan? This action cannot be undone.`)) {
      return;
    }

    this.isLoadingPlans = true;
    this.planErrorMessage = '';
    this.planSuccessMessage = '';

    this.statsService.deleteSubscriptionPlan(planId).subscribe({
      next: (success) => {
        console.log('Plan deleted successfully');
        // Remove the plan from the local array
        this.subscriptionPlans = this.subscriptionPlans.filter(p => p.id !== planId);
        this.isLoadingPlans = false;
        this.planSuccessMessage = `Plan "${planName}" deleted successfully!`;

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.planSuccessMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error deleting subscription plan:', error);
        if (error.message === 'Not authorized') {
          this.planErrorMessage = 'Not authorized to delete subscription plans. Please check the FIX-SUBSCRIPTION-PLANS.md file for solutions.';
        } else if (error.message === 'Cannot delete plan that is in use by organizations') {
          this.planErrorMessage = 'Cannot delete this plan because it is currently in use by one or more organizations.';
        } else if (error.message.includes('COALESCE could not convert type')) {
          this.planErrorMessage = 'Type conversion error. Please check the FIX-SUBSCRIPTION-PLANS.md file for solutions.';
        } else {
          this.planErrorMessage = 'Failed to delete subscription plan. Please try again.';
        }
        this.isLoadingPlans = false;
      }
    });
  }
}
