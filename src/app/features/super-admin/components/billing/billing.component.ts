import { Component, OnInit } from '@angular/core';
import { SuperAdminStatsService, BillingRecord, BillingSummary } from '../../services/super-admin-stats.service';

@Component({
  selector: 'app-billing',
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Billing Management</h1>
        <div class="flex space-x-2">
          <button (click)="refreshData()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <span class="material-icons mr-1">refresh</span>
            Refresh
          </button>
          <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
            <span class="material-icons mr-1">receipt</span>
            Generate Invoices
          </button>
          <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center">
            <span class="material-icons mr-1">download</span>
            Export
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Total Revenue</p>
              <h3 class="text-2xl font-bold">£{{ totalRevenue.toFixed(2) }}</h3>
            </div>
            <span class="material-icons text-green-500">payments</span>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Outstanding Invoices</p>
              <h3 class="text-2xl font-bold">£{{ outstandingAmount.toFixed(2) }}</h3>
            </div>
            <span class="material-icons text-yellow-500">receipt_long</span>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Active Subscriptions</p>
              <h3 class="text-2xl font-bold">{{ activeSubscriptions }}</h3>
            </div>
            <span class="material-icons text-blue-500">subscriptions</span>
          </div>
        </div>
      </div>

      <!-- Invoices Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="p-4 border-b flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <span class="material-icons text-gray-500">search</span>
            <input
              type="text"
              placeholder="Search invoices..."
              class="border-none focus:ring-0 text-sm"
            >
          </div>
          <div class="flex space-x-2">
            <select class="text-sm border-gray-300 rounded-md">
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <select class="text-sm border-gray-300 rounded-md">
              <option value="all">All Organizations</option>
              <!-- Organizations would be populated here -->
            </select>
          </div>
        </div>

        <!-- Loading indicator -->
        <div *ngIf="isLoading" class="p-6 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p class="text-gray-500">Loading billing records...</p>
        </div>

        <!-- Error message -->
        <div *ngIf="errorMessage && !isLoading" class="p-6 text-center">
          <div class="bg-red-50 text-red-600 p-4 rounded-lg inline-flex items-center">
            <span class="material-icons mr-2">error</span>
            {{ errorMessage }}
          </div>
          <button (click)="refreshData()" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Try Again
          </button>
        </div>

        <!-- Billing records table -->
        <table *ngIf="!isLoading && !errorMessage" class="min-w-full">
          <thead>
            <tr class="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th class="px-6 py-3">Invoice #</th>
              <th class="px-6 py-3">Organization</th>
              <th class="px-6 py-3">Amount</th>
              <th class="px-6 py-3">Status</th>
              <th class="px-6 py-3">Invoice Date</th>
              <th class="px-6 py-3">Due Date</th>
              <th class="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let record of billingRecords" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                INV-{{ record.id.substring(0, 8).toUpperCase() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ record.organization_name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                £{{ record.amount.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="{
                        'bg-green-100 text-green-800': record.status === 'paid',
                        'bg-yellow-100 text-yellow-800': record.status === 'pending',
                        'bg-red-100 text-red-800': record.status === 'failed'
                      }">
                  {{ record.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(record.invoice_date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(record.due_date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3">View</button>
                <button class="text-green-600 hover:text-green-900">Mark Paid</button>
              </td>
            </tr>

            <tr *ngIf="billingRecords.length === 0 && !isLoading && !errorMessage">
              <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                No invoices found
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!isLoading && !errorMessage" class="px-6 py-4 border-t flex items-center justify-between">
          <div class="text-sm text-gray-500">
            Showing <span class="font-medium">{{ billingRecords.length }}</span> of <span class="font-medium">{{ totalRecords }}</span> invoices
          </div>
          <div class="flex space-x-2">
            <button
              (click)="previousPage()"
              class="px-3 py-1 border rounded text-sm"
              [disabled]="currentPage === 1 || isLoading"
              [ngClass]="{'opacity-50 cursor-not-allowed': currentPage === 1 || isLoading, 'hover:bg-gray-100': currentPage > 1 && !isLoading}"
            >
              Previous
            </button>
            <span class="px-3 py-1 text-sm">Page {{ currentPage }}</span>
            <button
              (click)="nextPage()"
              class="px-3 py-1 border rounded text-sm"
              [disabled]="currentPage * pageSize >= totalRecords || isLoading"
              [ngClass]="{'opacity-50 cursor-not-allowed': currentPage * pageSize >= totalRecords || isLoading, 'hover:bg-gray-100': currentPage * pageSize < totalRecords && !isLoading}"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BillingComponent implements OnInit {
  billingRecords: BillingRecord[] = [];
  totalRevenue = 0;
  outstandingAmount = 0;
  activeSubscriptions = 0;
  currentPage = 1;
  pageSize = 10;
  isLoading = false;
  errorMessage = '';
  totalRecords = 0;

  constructor(private statsService: SuperAdminStatsService) {}

  ngOnInit() {
    this.loadBillingData();
    this.loadSummaryData();
  }

  loadBillingData() {
    this.isLoading = true;
    this.errorMessage = '';

    this.statsService.getBillingRecords(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.billingRecords = data.records || [];
        this.totalRecords = data.total_count || 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading billing records:', error);
        this.billingRecords = [];
        this.errorMessage = 'Failed to load billing records. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadSummaryData() {
    this.statsService.getBillingSummary().subscribe({
      next: (data: BillingSummary) => {
        this.totalRevenue = data.totalRevenue || 0;
        this.outstandingAmount = data.outstandingAmount || 0;
        this.activeSubscriptions = data.activeSubscriptions || 0;
      },
      error: (error) => {
        console.error('Error loading billing summary:', error);
        this.totalRevenue = 0;
        this.outstandingAmount = 0;
        this.activeSubscriptions = 0;
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  previousPage() {
    if (this.currentPage > 1 && !this.isLoading) {
      this.currentPage--;
      this.loadBillingData();
    }
  }

  nextPage() {
    if (!this.isLoading && this.currentPage * this.pageSize < this.totalRecords) {
      this.currentPage++;
      this.loadBillingData();
    }
  }

  refreshData() {
    this.loadBillingData();
    this.loadSummaryData();
  }
}
