import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SuperAdminStatsService, SystemSettings, SubscriptionPlan } from '../../services/super-admin-stats.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class SettingsStandaloneComponent implements OnInit {
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
    this.loadSubscriptionPlans();
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
        // Update the plan in the local array
        const index = this.subscriptionPlans.findIndex(p => p.id === planId);
        if (index !== -1) {
          this.subscriptionPlans[index] = updatedPlan;
        }
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
        // Add the new plan to the local array
        this.subscriptionPlans.push(newPlan);
        // Sort plans by price
        this.subscriptionPlans.sort((a, b) => a.price - b.price);
        this.isLoadingPlans = false;
      },
      error: (error) => {
        console.error('Error adding subscription plan:', error);
        this.planErrorMessage = 'Failed to add subscription plan. Please try again.';
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
