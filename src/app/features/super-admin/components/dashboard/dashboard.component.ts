import { Component, OnInit } from '@angular/core';
import { SuperAdminStatsService, DashboardStats } from '../../services/super-admin-stats.service';

@Component({
  selector: 'app-super-admin-dashboard',
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Super Admin Dashboard</h1>
        <button (click)="loadDashboardStats()" class="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 flex items-center">
          <span class="material-icons text-sm mr-1">refresh</span>
          Refresh
        </button>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Total Screens</p>
              <h3 class="text-2xl font-bold">{{stats.totalScreens || 0}}</h3>
            </div>
            <span class="material-icons text-green-500">desktop_windows</span>
          </div>
          <div class="mt-2 text-sm text-gray-600">
            {{stats.activeScreensPercentage || 0}}% active
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Total Users</p>
              <h3 class="text-2xl font-bold">{{stats.totalUsers || 0}}</h3>
            </div>
            <span class="material-icons text-blue-500">people</span>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Monthly Revenue</p>
              <h3 class="text-2xl font-bold">£{{stats.revenueThisMonth || 0}}</h3>
            </div>
            <span class="material-icons text-purple-500">payments</span>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">System Status</p>
              <h3 class="text-2xl font-bold text-green-500">Online</h3>
            </div>
            <span class="material-icons text-green-500">check_circle</span>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <h2 class="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div class="p-6">
          <app-activity-log></app-activity-log>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <h2 class="text-lg font-semibold">Quick Actions</h2>
        </div>
        <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button class="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg flex items-center justify-center">
            <span class="material-icons mr-2">person_add</span>
            Add New User
          </button>
          <button class="bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg flex items-center justify-center">
            <span class="material-icons mr-2">business</span>
            Create Organization
          </button>
          <button class="bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg flex items-center justify-center">
            <span class="material-icons mr-2">receipt_long</span>
            Generate Invoices
          </button>
        </div>
      </div>
    </div>
  `
})
export class SuperAdminDashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalScreens: 0,
    totalUsers: 0,
    revenueThisMonth: 0,
    activeScreensPercentage: 0
  };
  loading = false;

  constructor(private statsService: SuperAdminStatsService) {}

  ngOnInit() {
    this.loadDashboardStats();
  }

  loadDashboardStats() {
    this.loading = true;
    this.statsService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.loading = false;
      }
    });
  }
}
