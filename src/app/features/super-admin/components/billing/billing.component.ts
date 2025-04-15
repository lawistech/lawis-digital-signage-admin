import { Component, OnInit } from '@angular/core';
import { SuperAdminStatsService, BillingRecord, BillingSummary } from '../../services/super-admin-stats.service';

@Component({
  selector: 'app-billing',
  template: `
    <div class="space-y-8">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Billing Management</h1>
          <p class="text-sm text-slate-500 mt-1">Manage invoices and subscription payments</p>
        </div>
        <div class="flex space-x-3">
          <button
            (click)="refreshData()"
            class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center transition-colors duration-200 shadow-sm"
            [class.opacity-70]="isLoading"
            [disabled]="isLoading"
          >
            <span class="material-icons text-sm mr-2" [class.animate-spin]="isLoading">{{ isLoading ? 'autorenew' : 'refresh' }}</span>
            {{ isLoading ? 'Refreshing...' : 'Refresh' }}
          </button>
          <button class="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 flex items-center transition-colors duration-200 shadow-sm">
            <span class="material-icons text-sm mr-2">receipt</span>
            Generate Invoices
          </button>
          <button class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center transition-colors duration-200 shadow-sm">
            <span class="material-icons text-sm mr-2">download</span>
            Export
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Total Revenue Card -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300 overflow-hidden relative group">
          <div class="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Total Revenue</p>
              <h3 class="text-3xl font-bold text-slate-800 mt-1">£{{ totalRevenue.toFixed(2) }}</h3>
            </div>
            <div class="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300">
              <span class="material-icons">payments</span>
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm text-slate-600">
            <span class="material-icons text-emerald-500 text-sm mr-1">trending_up</span>
            <span>Total revenue to date</span>
          </div>
        </div>

        <!-- Outstanding Invoices Card -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300 overflow-hidden relative group">
          <div class="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Outstanding Invoices</p>
              <h3 class="text-3xl font-bold text-slate-800 mt-1">£{{ outstandingAmount.toFixed(2) }}</h3>
            </div>
            <div class="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform duration-300">
              <span class="material-icons">receipt_long</span>
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm text-slate-600">
            <span class="material-icons text-amber-500 text-sm mr-1">schedule</span>
            <span>Pending payments</span>
          </div>
        </div>

        <!-- Active Subscriptions Card -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300 overflow-hidden relative group">
          <div class="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Active Subscriptions</p>
              <h3 class="text-3xl font-bold text-slate-800 mt-1">{{ activeSubscriptions }}</h3>
            </div>
            <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
              <span class="material-icons">subscriptions</span>
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm text-slate-600">
            <span class="material-icons text-blue-500 text-sm mr-1">people</span>
            <span>Current active users</span>
          </div>
        </div>
      </div>

      <!-- Invoices Table -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-5 border-b border-slate-200">
          <div class="flex flex-col md:flex-row md:items-center gap-4">
            <!-- Search -->
            <div class="relative flex-grow">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="material-icons text-slate-400 text-lg">search</span>
              </div>
              <input
                type="text"
                placeholder="Search invoices by ID or organization..."
                class="pl-10 pr-4 py-2 border border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md w-full text-sm text-slate-700"
              >
            </div>

            <div class="flex flex-wrap gap-3">
              <!-- Status filter -->
              <div class="relative">
                <select
                  class="appearance-none pl-3 pr-8 py-2 border border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md text-sm text-slate-700 bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <span class="material-icons text-slate-400 text-sm">expand_more</span>
                </div>
              </div>

              <!-- Organization filter -->
              <div class="relative">
                <select
                  class="appearance-none pl-3 pr-8 py-2 border border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md text-sm text-slate-700 bg-white"
                >
                  <option value="all">All Organizations</option>
                  <!-- Organizations would be populated here -->
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <span class="material-icons text-slate-400 text-sm">expand_more</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div *ngIf="isLoading" class="p-10 text-center">
          <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600 mb-4"></div>
          <p class="text-slate-500 font-medium">Loading billing records...</p>
        </div>

        <!-- Error message -->
        <div *ngIf="errorMessage && !isLoading" class="p-10 text-center">
          <div class="inline-flex flex-col items-center">
            <div class="h-16 w-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-4">
              <span class="material-icons text-3xl">error_outline</span>
            </div>
            <h3 class="text-lg font-medium text-slate-800 mb-2">Error Loading Records</h3>
            <p class="text-slate-600 mb-6 max-w-md mx-auto">{{ errorMessage }}</p>
            <button
              (click)="refreshData()"
              class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center transition-colors duration-200 shadow-sm mx-auto"
            >
              <span class="material-icons text-sm mr-2">autorenew</span>
              Try Again
            </button>
          </div>
        </div>

        <!-- Billing records table -->
        <table *ngIf="!isLoading && !errorMessage" class="min-w-full divide-y divide-slate-200">
          <thead>
            <tr class="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              <th class="px-6 py-4 font-semibold">Invoice #</th>
              <th class="px-6 py-4 font-semibold">Organization</th>
              <th class="px-6 py-4 font-semibold">Amount</th>
              <th class="px-6 py-4 font-semibold">Status</th>
              <th class="px-6 py-4 font-semibold">Invoice Date</th>
              <th class="px-6 py-4 font-semibold">Due Date</th>
              <th class="px-6 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr *ngFor="let record of billingRecords" class="hover:bg-slate-50 transition-colors duration-150">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-slate-800 flex items-center">
                  <span class="material-icons text-indigo-500 mr-2 text-sm">receipt</span>
                  INV-{{ record.id.substring(0, 8).toUpperCase() }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-slate-700">{{ record.organization_name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-slate-800">£{{ record.amount.toFixed(2) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="{
                        'bg-emerald-100 text-emerald-800': record.status === 'paid',
                        'bg-amber-100 text-amber-800': record.status === 'pending',
                        'bg-red-100 text-red-800': record.status === 'failed'
                      }">
                  <span class="material-icons text-xs mr-1"
                        [ngClass]="{
                          'text-emerald-600': record.status === 'paid',
                          'text-amber-600': record.status === 'pending',
                          'text-red-600': record.status === 'failed'
                        }">{{ record.status === 'paid' ? 'check_circle' : (record.status === 'pending' ? 'schedule' : 'error') }}</span>
                  {{ record.status | titlecase }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-slate-600">{{ formatDate(record.invoice_date) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-slate-600">{{ formatDate(record.due_date) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-900 mr-3 transition-colors duration-150">View</button>
                <button class="text-emerald-600 hover:text-emerald-900 transition-colors duration-150">Mark Paid</button>
              </td>
            </tr>

            <tr *ngIf="billingRecords.length === 0 && !isLoading && !errorMessage">
              <td colspan="7" class="px-6 py-10 text-center">
                <div class="inline-flex flex-col items-center">
                  <div class="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                    <span class="material-icons">receipt_long</span>
                  </div>
                  <p class="text-slate-500 font-medium">No invoices found</p>
                  <p class="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!isLoading && !errorMessage" class="px-6 py-5 border-t border-slate-200 flex items-center justify-between bg-white">
          <div class="text-sm text-slate-600 flex items-center">
            <span class="material-icons text-indigo-500 mr-2 text-sm">receipt_long</span>
            Showing <span class="font-medium mx-1">{{ billingRecords.length }}</span> of <span class="font-medium mx-1">{{ totalRecords }}</span> invoices
          </div>
          <div class="flex items-center space-x-4">
            <button
              (click)="previousPage()"
              class="px-4 py-2 border border-slate-300 rounded-md text-sm text-slate-700 hover:bg-slate-50 flex items-center transition-colors duration-150 shadow-sm"
              [disabled]="currentPage === 1 || isLoading"
              [ngClass]="{'opacity-50 cursor-not-allowed': currentPage === 1 || isLoading}"
            >
              <span class="material-icons text-sm mr-1">chevron_left</span>
              Previous
            </button>
            <div class="px-4 py-2 bg-slate-100 rounded-md text-sm font-medium text-slate-700">
              Page {{ currentPage }}
            </div>
            <button
              (click)="nextPage()"
              class="px-4 py-2 border border-slate-300 rounded-md text-sm text-slate-700 hover:bg-slate-50 flex items-center transition-colors duration-150 shadow-sm"
              [disabled]="currentPage * pageSize >= totalRecords || isLoading"
              [ngClass]="{'opacity-50 cursor-not-allowed': currentPage * pageSize >= totalRecords || isLoading}"
            >
              Next
              <span class="material-icons text-sm ml-1">chevron_right</span>
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
