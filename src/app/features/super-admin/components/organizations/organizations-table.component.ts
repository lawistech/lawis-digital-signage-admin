import { Component, Input, OnInit } from '@angular/core';
import { OrganizationService, Organization } from '../../../../core/services/organization.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-organizations-table',
  template: `
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
      <p>No organizations found.</p>
    </div>

    <!-- Organizations table -->
    <table *ngIf="!isLoading && organizations.length > 0" class="min-w-full">
      <thead>
        <tr class="border-b">
          <th class="text-left py-3 px-4">Organization</th>
          <th class="text-left py-3 px-4">Subscription</th>
          <th class="text-left py-3 px-4">Screens</th>
          <th class="text-left py-3 px-4">Users</th>
          <th class="text-left py-3 px-4">Status</th>
          <th class="text-left py-3 px-4">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let org of organizations" class="border-b hover:bg-gray-50">
          <td class="py-3 px-4">
            <div class="font-medium">{{org.name}}</div>
            <div class="text-sm text-gray-500">ID: {{org.id}}</div>
          </td>
          <td class="py-3 px-4">
            <div class="font-medium">{{org.subscriptionTier}}</div>
            <div class="text-sm text-gray-500">
              {{org.subscriptionStatus}}
            </div>
          </td>
          <td class="py-3 px-4">
            {{org.screenCount}} / {{org.maxScreens}}
          </td>
          <td class="py-3 px-4">
            {{org.userCount}} / {{org.maxUsers}}
          </td>
          <td class="py-3 px-4">
            <span [class]="getStatusBadgeClass(org.subscriptionStatus)">
              {{org.subscriptionStatus}}
            </span>
          </td>
          <td class="py-3 px-4">
            <button (click)="viewDetails(org)"
                    class="text-blue-600 hover:text-blue-800 mr-2">
              View
            </button>
            <button (click)="editOrganization(org)"
                    class="text-gray-600 hover:text-gray-800">
              Edit
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class OrganizationsTableComponent implements OnInit {
  @Input() limit?: number;
  organizations: Organization[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private orgService: OrganizationService) {}

  ngOnInit() {
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.isLoading = true;
    this.errorMessage = '';

    this.orgService.getOrganizations().pipe(
      catchError(error => {
        console.error('Error loading organizations in table:', error);
        this.errorMessage = 'Failed to load organizations. Please try again.';
        return of([]);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(orgs => {
      console.log('Organizations loaded in table:', orgs);
      this.organizations = this.limit ? orgs.slice(0, this.limit) : orgs;
    });
  }

  getStatusBadgeClass(status: string): string {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    const statusClasses: {[key: string]: string} = {
      'active': 'bg-green-100 text-green-800',
      'suspended': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800'
    };
    return `${baseClasses} ${statusClasses[status] || ''}`;
  }

  viewDetails(org: any) {
    // Implement view details logic
  }

  editOrganization(org: any) {
    // Implement edit logic
  }
}