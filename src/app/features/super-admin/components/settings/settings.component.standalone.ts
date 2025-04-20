import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SuperAdminStatsService, SystemSettings, SubscriptionPlan } from '../../services/super-admin-stats.service';
import { EventBusService, EventData } from '../../services/event-bus.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings-standalone',
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">System Settings</h1>

      <!-- Tabs -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8">
          <button
            (click)="setActiveTab('general')"
            class="py-2 px-1 border-b-2 font-medium text-sm"
            [class.border-indigo-500]="activeTab === 'general'"
            [class.text-indigo-600]="activeTab === 'general'"
            [class.border-transparent]="activeTab !== 'general'"
            [class.text-gray-500]="activeTab !== 'general'"
          >
            General
          </button>
          <button
            (click)="setActiveTab('plans')"
            class="py-2 px-1 border-b-2 font-medium text-sm"
            [class.border-indigo-500]="activeTab === 'plans'"
            [class.text-indigo-600]="activeTab === 'plans'"
            [class.border-transparent]="activeTab !== 'plans'"
            [class.text-gray-500]="activeTab !== 'plans'"
          >
            Subscription Plans
          </button>
          <button
            (click)="setActiveTab('email')"
            class="py-2 px-1 border-b-2 font-medium text-sm"
            [class.border-indigo-500]="activeTab === 'email'"
            [class.text-indigo-600]="activeTab === 'email'"
            [class.border-transparent]="activeTab !== 'email'"
            [class.text-gray-500]="activeTab !== 'email'"
          >
            Email Templates
          </button>
          <button
            (click)="setActiveTab('logs')"
            class="py-2 px-1 border-b-2 font-medium text-sm"
            [class.border-indigo-500]="activeTab === 'logs'"
            [class.text-indigo-600]="activeTab === 'logs'"
            [class.border-transparent]="activeTab !== 'logs'"
            [class.text-gray-500]="activeTab !== 'logs'"
          >
            System Logs
          </button>
        </nav>
      </div>

      <!-- Content based on active tab -->
      <div *ngIf="activeTab === 'general'" class="space-y-6">
        <h2 class="text-lg font-medium">General Settings</h2>
        <!-- General settings form -->
      </div>

      <div *ngIf="activeTab === 'plans'" class="space-y-6">
        <h2 class="text-lg font-medium">Subscription Plans</h2>
        <div *ngIf="isLoadingPlans" class="text-center py-4">
          <div class="spinner"></div>
          <p class="mt-2 text-gray-500">Loading plans...</p>
        </div>
        <div *ngIf="!isLoadingPlans && subscriptionPlans.length === 0" class="text-center py-4">
          <p class="text-gray-500">No subscription plans found.</p>
        </div>
        <div *ngIf="!isLoadingPlans && subscriptionPlans.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let plan of subscriptionPlans" class="border rounded-lg p-4 shadow-sm">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-medium">{{ plan.name }}</h3>
              <span class="text-gray-500">£{{ plan.price }}/mo</span>
            </div>
            <p class="text-sm text-gray-600 mb-2">{{ plan.description || 'No description' }}</p>
            <div class="text-sm">
              <div><strong>Max Screens:</strong> {{ plan.max_screens }}</div>
              <div><strong>Max Users:</strong> {{ plan.max_users }}</div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="activeTab === 'email'" class="space-y-6">
        <h2 class="text-lg font-medium">Email Templates</h2>
        <!-- Email templates content -->
      </div>

      <div *ngIf="activeTab === 'logs'" class="space-y-6">
        <h2 class="text-lg font-medium">System Logs</h2>
        <!-- System logs content -->
      </div>
    </div>
  `,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class SettingsStandaloneComponent implements OnInit, OnDestroy {
  // Tabs
  activeTab = 'general';

  // General Settings
  generalSettingsForm: FormGroup;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  // Subscription Plans
  subscriptionPlans: SubscriptionPlan[] = [];
  isLoadingPlans = false;
  planErrorMessage = '';

  // Email Templates
  emailTemplates = [
    { id: 'welcome', name: 'Welcome Email', subject: 'Welcome to Digital Signage Platform' },
    { id: 'password-reset', name: 'Password Reset', subject: 'Reset Your Password' },
    { id: 'invoice', name: 'Invoice', subject: 'Your Monthly Invoice' }
  ];
  selectedTemplate = this.emailTemplates[0];
  emailContent = `<p>Dear {{user.name}},</p>
<p>Welcome to the Digital Signage Platform! We're excited to have you on board.</p>
<p>Your account has been successfully created and is ready to use.</p>
<p>If you have any questions, please don't hesitate to contact our support team.</p>
<p>Best regards,<br>The Digital Signage Team</p>`;

  // System Logs
  systemLogs = [
    { id: 1, type: 'info', message: 'System started', timestamp: '2023-06-01T08:00:00Z' },
    { id: 2, type: 'warning', message: 'High CPU usage detected', timestamp: '2023-06-01T10:15:00Z' },
    { id: 3, type: 'error', message: 'Database connection failed', timestamp: '2023-06-01T12:30:00Z' },
    { id: 4, type: 'info', message: 'Backup completed', timestamp: '2023-06-01T14:45:00Z' },
    { id: 5, type: 'info', message: 'User john.doe@example.com logged in', timestamp: '2023-06-01T16:00:00Z' }
  ];

  // Subscriptions for event bus
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private statsService: SuperAdminStatsService,
    private eventBus: EventBusService
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
    this.setupEventListeners();
  }

  ngOnDestroy() {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  setupEventListeners() {
    // Listen for subscription plan updates
    this.subscriptions.push(
      this.eventBus.on('subscription-plan-updated').subscribe((event: EventData) => {
        console.log('Received subscription-plan-updated event:', event);
        const updatedPlan = event.payload as SubscriptionPlan;

        // Update the plan in the local array
        const index = this.subscriptionPlans.findIndex(p => p.id === updatedPlan.id);
        if (index !== -1) {
          console.log(`Updating plan at index ${index}:`, updatedPlan);
          this.subscriptionPlans[index] = updatedPlan;
          // Force change detection
          this.subscriptionPlans = [...this.subscriptionPlans];
        }
      })
    );

    // Listen for new subscription plans
    this.subscriptions.push(
      this.eventBus.on('subscription-plan-added').subscribe((event: EventData) => {
        console.log('Received subscription-plan-added event:', event);
        const newPlan = event.payload as SubscriptionPlan;

        // Add the new plan to the local array if it doesn't exist already
        if (!this.subscriptionPlans.some(p => p.id === newPlan.id)) {
          console.log('Adding new plan to local array:', newPlan);
          this.subscriptionPlans.push(newPlan);
          // Sort plans by price
          this.subscriptionPlans.sort((a, b) => a.price - b.price);
          // Force change detection
          this.subscriptionPlans = [...this.subscriptionPlans];
        }
      })
    );

    // Listen for subscription plan deletions
    this.subscriptions.push(
      this.eventBus.on('subscription-plan-deleted').subscribe((event: EventData) => {
        console.log('Received subscription-plan-deleted event:', event);
        const planId = event.payload as string;

        // Remove the plan from the local array
        const initialLength = this.subscriptionPlans.length;
        this.subscriptionPlans = this.subscriptionPlans.filter(p => p.id !== planId);

        if (this.subscriptionPlans.length !== initialLength) {
          console.log(`Removed plan with ID ${planId} from local array`);
          // Force change detection
          this.subscriptionPlans = [...this.subscriptionPlans];
        }
      })
    );
  }

  loadSubscriptionPlans() {
    this.isLoadingPlans = true;
    this.planErrorMessage = '';
    console.log('Loading subscription plans...');

    this.statsService.getSubscriptionPlans().subscribe({
      next: (plans) => {
        console.log('Subscription plans loaded successfully:', plans);
        this.subscriptionPlans = plans;
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
    // Temporarily disabled until Angular Material is properly installed
    console.log('Edit plan dialog is temporarily disabled');
    console.log('Plan to edit:', plan);
  }

  updateSubscriptionPlan(planId: string, planData: Partial<SubscriptionPlan>) {
    this.isLoadingPlans = true;
    this.planErrorMessage = '';

    this.statsService.updateSubscriptionPlan(planId, planData).subscribe({
      next: (updatedPlan) => {
        console.log('Plan updated successfully:', updatedPlan);
        // The local array will be updated via the event bus
        this.isLoadingPlans = false;
      },
      error: (error) => {
        console.error('Error updating subscription plan:', error);
        this.planErrorMessage = 'Failed to update subscription plan. Please try again.';
        this.isLoadingPlans = false;
      }
    });
  }

  addSubscriptionPlan(planData: Partial<SubscriptionPlan>) {
    this.isLoadingPlans = true;
    this.planErrorMessage = '';

    this.statsService.addSubscriptionPlan(planData).subscribe({
      next: (newPlan) => {
        console.log('Plan added successfully:', newPlan);
        // The local array will be updated via the event bus
        this.isLoadingPlans = false;
      },
      error: (error) => {
        console.error('Error adding subscription plan:', error);
        this.planErrorMessage = 'Failed to add subscription plan. Please try again.';
        this.isLoadingPlans = false;
      }
    });
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

    this.statsService.deleteSubscriptionPlan(planId).subscribe({
      next: () => {
        console.log('Plan deleted successfully');
        // The local array will be updated via the event bus
        this.isLoadingPlans = false;
      },
      error: (error) => {
        console.error('Error deleting subscription plan:', error);
        this.planErrorMessage = 'Failed to delete subscription plan. Please try again.';
        this.isLoadingPlans = false;
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
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

  saveEmailTemplate() {
    console.log('Saving email template:', this.selectedTemplate.id);
    // Implement email template saving logic here
  }

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
}
