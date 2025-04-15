import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SuperAdminStatsService, SystemSettings } from '../../services/super-admin-stats.service';

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
          <div class="px-6 py-4 border-b border-slate-200 flex items-center">
            <span class="material-icons mr-2 text-indigo-600">subscriptions</span>
            <h2 class="text-lg font-semibold text-slate-800">Subscription Plans</h2>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div *ngFor="let plan of subscriptionPlans; let i = index"
                   class="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-300 relative overflow-hidden"
                   [ngClass]="{
                     'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200': plan.name === 'Basic',
                     'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200': plan.name === 'Standard',
                     'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200': plan.name === 'Premium'
                   }">
                <div class="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                  <div class="absolute transform rotate-45 bg-indigo-600 text-white text-xs font-bold py-1 right-[-35px] top-[15px] w-[170px] text-center"
                       *ngIf="plan.name === 'Premium'">POPULAR</div>
                </div>
                <div class="flex justify-between items-center">
                  <h3 class="font-bold text-slate-800 text-lg">{{ plan.name }}</h3>
                  <button class="text-indigo-600 hover:text-indigo-800 text-sm flex items-center transition-colors duration-150">
                    <span class="material-icons text-sm mr-1">edit</span>
                    Edit
                  </button>
                </div>
                <div class="mt-2 flex items-baseline">
                  <span class="text-2xl font-bold text-slate-800">£{{ plan.price }}</span>
                  <span class="text-slate-500 text-sm ml-1">/ month</span>
                </div>
                <div class="mt-4 space-y-2">
                  <div class="flex items-center text-sm text-slate-600">
                    <span class="material-icons text-indigo-500 mr-2 text-sm">desktop_windows</span>
                    <span>{{ plan.maxScreens }} screens</span>
                  </div>
                  <div class="flex items-center text-sm text-slate-600">
                    <span class="material-icons text-indigo-500 mr-2 text-sm">people</span>
                    <span>{{ plan.maxUsers }} users</span>
                  </div>
                </div>
              </div>

              <button class="w-full border border-dashed border-slate-300 rounded-lg p-4 text-slate-500 hover:text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 transition-colors duration-200 flex items-center justify-center">
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

  subscriptionPlans = [
    { name: 'Basic', price: 9.99, maxScreens: 1, maxUsers: 2 },
    { name: 'Standard', price: 29.99, maxScreens: 5, maxUsers: 10 },
    { name: 'Premium', price: 99.99, maxScreens: 20, maxUsers: 50 }
  ];

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
    private statsService: SuperAdminStatsService
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
  }

  loadSettings() {
    this.isLoading = true;
    this.errorMessage = '';

    this.statsService.getSystemSettings().subscribe({
      next: (settings: SystemSettings) => {
        this.generalSettingsForm.patchValue({
          systemName: settings.system_name,
          supportEmail: settings.support_email,
          timezone: settings.timezone,
          maintenanceMode: settings.maintenance_mode
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading settings:', error);
        this.errorMessage = 'Failed to load settings. Please try again.';
        this.isLoading = false;
      }
    });
  }

  saveGeneralSettings() {
    if (this.generalSettingsForm.invalid) return;

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValues = this.generalSettingsForm.value;

    // Map form values to the expected format
    const settings: Partial<SystemSettings> = {
      system_name: formValues.systemName,
      support_email: formValues.supportEmail,
      timezone: formValues.timezone,
      maintenance_mode: formValues.maintenanceMode
    };

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
        this.errorMessage = 'Failed to save settings. Please try again.';
        this.isSaving = false;
      }
    });
  }

  getLogIcon(level: string): string {
    switch (level) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  getEmailIcon(templateName: string): string {
    switch (templateName) {
      case 'Welcome Email': return 'person_add';
      case 'Password Reset': return 'lock';
      case 'Invoice': return 'receipt';
      case 'Subscription Expiring': return 'schedule';
      default: return 'email';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleString();
  }
}
