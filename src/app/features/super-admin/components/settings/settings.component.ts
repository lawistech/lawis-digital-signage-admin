import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SuperAdminStatsService, SystemSettings } from '../../services/super-admin-stats.service';

@Component({
  selector: 'app-settings',
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold">System Settings</h1>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- General Settings -->
        <div class="bg-white rounded-lg shadow overflow-hidden col-span-2">
          <div class="p-4 border-b">
            <h2 class="text-lg font-semibold">General Settings</h2>
          </div>
          <div class="p-6">
            <!-- Loading indicator -->
            <div *ngIf="isLoading" class="text-center py-4">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p class="text-gray-500">Loading settings...</p>
            </div>

            <!-- Error message -->
            <div *ngIf="errorMessage" class="mb-4">
              <div class="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
                <span class="material-icons mr-2">error</span>
                {{ errorMessage }}
              </div>
            </div>

            <!-- Success message -->
            <div *ngIf="successMessage" class="mb-4">
              <div class="bg-green-50 text-green-600 p-4 rounded-lg flex items-center">
                <span class="material-icons mr-2">check_circle</span>
                {{ successMessage }}
              </div>
            </div>

            <form [formGroup]="generalSettingsForm" (ngSubmit)="saveGeneralSettings()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  System Name
                </label>
                <input
                  type="text"
                  formControlName="systemName"
                  class="w-full rounded-md border-gray-300"
                  [disabled]="isLoading || isSaving"
                >
                <div *ngIf="generalSettingsForm.get('systemName')?.invalid && generalSettingsForm.get('systemName')?.touched" class="text-red-500 text-sm mt-1">
                  System name is required
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  formControlName="supportEmail"
                  class="w-full rounded-md border-gray-300"
                  [disabled]="isLoading || isSaving"
                >
                <div *ngIf="generalSettingsForm.get('supportEmail')?.invalid && generalSettingsForm.get('supportEmail')?.touched" class="text-red-500 text-sm mt-1">
                  Valid email address is required
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Default Timezone
                </label>
                <select formControlName="timezone" class="w-full rounded-md border-gray-300" [disabled]="isLoading || isSaving">
                  <option value="UTC">UTC</option>
                  <option value="Europe/London">London (GMT/BST)</option>
                  <option value="America/New_York">New York (EST/EDT)</option>
                  <option value="America/Los_Angeles">Los Angeles (PST/PDT)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </div>

              <div class="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  formControlName="maintenanceMode"
                  class="rounded border-gray-300 text-blue-600"
                  [disabled]="isLoading || isSaving"
                >
                <label for="maintenanceMode" class="ml-2 block text-sm text-gray-700">
                  Enable Maintenance Mode
                </label>
              </div>

              <div class="flex items-center space-x-2">
                <button
                  type="submit"
                  class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  [disabled]="generalSettingsForm.invalid || generalSettingsForm.pristine || isLoading || isSaving"
                  [ngClass]="{'opacity-50 cursor-not-allowed': generalSettingsForm.invalid || generalSettingsForm.pristine || isLoading || isSaving}"
                >
                  <span *ngIf="isSaving" class="material-icons animate-spin mr-1 text-sm">refresh</span>
                  <span *ngIf="!isSaving" class="material-icons mr-1 text-sm">save</span>
                  {{ isSaving ? 'Saving...' : 'Save Settings' }}
                </button>

                <button
                  type="button"
                  class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  [disabled]="isLoading || isSaving"
                  (click)="loadSettings()"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Subscription Plans -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="p-4 border-b">
            <h2 class="text-lg font-semibold">Subscription Plans</h2>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div *ngFor="let plan of subscriptionPlans" class="border rounded-lg p-4">
                <div class="flex justify-between items-center">
                  <h3 class="font-medium">{{ plan.name }}</h3>
                  <button class="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                </div>
                <p class="text-gray-500 text-sm">£{{ plan.price }} / month</p>
                <div class="mt-2 text-sm">
                  <p>{{ plan.maxScreens }} screens</p>
                  <p>{{ plan.maxUsers }} users</p>
                </div>
              </div>

              <button class="w-full border border-dashed border-gray-300 rounded-lg p-3 text-gray-500 hover:text-gray-700 hover:border-gray-400">
                + Add New Plan
              </button>
            </div>
          </div>
        </div>

        <!-- Email Templates -->
        <div class="bg-white rounded-lg shadow overflow-hidden col-span-2">
          <div class="p-4 border-b">
            <h2 class="text-lg font-semibold">Email Templates</h2>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div *ngFor="let template of emailTemplates" class="border rounded-lg p-4">
                <div class="flex justify-between items-center">
                  <h3 class="font-medium">{{ template.name }}</h3>
                  <button class="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                </div>
                <p class="text-gray-500 text-sm">{{ template.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- System Logs -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="p-4 border-b flex justify-between items-center">
            <h2 class="text-lg font-semibold">System Logs</h2>
            <button class="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div class="p-4 max-h-80 overflow-y-auto">
            <div *ngFor="let log of systemLogs" class="py-2 border-b last:border-0">
              <div class="flex items-start">
                <span class="material-icons text-sm mr-2"
                      [ngClass]="{
                        'text-red-500': log.level === 'error',
                        'text-yellow-500': log.level === 'warning',
                        'text-blue-500': log.level === 'info'
                      }">
                  {{ getLogIcon(log.level) }}
                </span>
                <div>
                  <p class="text-sm">{{ log.message }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(log.timestamp) }}</p>
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

  formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleString();
  }
}
