import { Component, OnInit, ViewChild } from '@angular/core';
import { OrganizationService, Organization } from '../../../core/services/organization.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { CreateOrganizationDialogComponent } from './organizations/create-organization-dialog.component';

@Component({
  selector: 'app-organization-dashboard',
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Customer Organizations</h1>
        <button (click)="openCreateDialog()" class="btn-primary">
          Add Organization
        </button>
      </div>

      <!-- Loading indicator -->
      <div *ngIf="isLoading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error message -->
      <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>{{ errorMessage }}</p>
        <button (click)="loadOrganizations()" class="mt-2 text-blue-600 hover:underline">Try Again</button>
      </div>

      <!-- No organizations message -->
      <div *ngIf="!isLoading && !errorMessage && organizations.length === 0" class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <p>No organizations found. Click the "Add Organization" button to create one.</p>
      </div>

      <!-- Organizations grid -->
      <div *ngIf="!isLoading && organizations.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let org of organizations" class="bg-white p-4 rounded-lg shadow">
          <div class="flex justify-between items-start">
            <h3 class="text-lg font-semibold">{{org.name}}</h3>
            <span [class]="getStatusClass(org.subscriptionStatus)">
              {{org.subscriptionStatus}}
            </span>
          </div>

          <div class="mt-4 space-y-2">
            <p>Plan: {{org.subscriptionTier}}</p>
            <p>Users: {{org.userCount}} / {{org.maxUsers}}</p>
            <p>Screens: {{org.screenCount}} / {{org.maxScreens}}</p>
          </div>

          <div class="mt-4 flex space-x-2">
            <button (click)="editOrganization(org)" class="btn-secondary">
              Edit
            </button>
            <button (click)="viewDetails(org)" class="btn-secondary">
              Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Organization Dialog -->
    <app-create-organization-dialog
      (created)="onOrganizationCreated($event)"
      (cancelled)="onDialogCancelled()"></app-create-organization-dialog>
  `
})
export class OrganizationDashboardComponent implements OnInit {
  organizations: Organization[] = [];
  isLoading = false;
  errorMessage = '';

  @ViewChild(CreateOrganizationDialogComponent) createDialog!: CreateOrganizationDialogComponent;

  constructor(private orgService: OrganizationService) {}

  ngOnInit() {
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.isLoading = true;
    this.errorMessage = '';

    this.orgService.getOrganizations().pipe(
      catchError(error => {
        console.error('Error loading organizations:', error);
        this.errorMessage = 'Failed to load organizations. Please try again.';
        return of([]);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(orgs => {
      console.log('Organizations loaded:', orgs);
      this.organizations = orgs;
    });
  }

  getStatusClass(status: string): string {
    return {
      'active': 'text-green-600 bg-green-100',
      'suspended': 'text-red-600 bg-red-100',
      'pending': 'text-yellow-600 bg-yellow-100'
    }[status] || '';
  }

  openCreateDialog() {
    this.createDialog.show();
  }

  editOrganization(org: Organization) {
    // Implementation for editing an organization
    console.log('Editing organization:', org);
    // In a real implementation, you would open a dialog or modal with the org data
  }

  viewDetails(org: Organization) {
    // Implementation for viewing organization details
    console.log('Viewing organization details:', org);
    // In a real implementation, you would navigate to a details page or open a modal
  }

  onOrganizationCreated(org: Organization) {
    console.log('Organization created:', org);
    this.loadOrganizations();
  }

  onDialogCancelled() {
    console.log('Organization creation cancelled');
  }
}