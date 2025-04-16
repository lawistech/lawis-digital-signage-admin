import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SuperAdminStatsService, DashboardStats } from '../../services/super-admin-stats.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-super-admin-dashboard',
  template: `
    <div class="space-y-8">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p class="text-sm text-slate-500 mt-1">Overview of your digital signage platform</p>
        </div>
        <button
          (click)="loadDashboardStats()"
          class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center transition-colors duration-200 shadow-sm"
          [class.opacity-70]="loading"
          [disabled]="loading"
        >
          <span class="material-icons text-sm mr-2" [class.animate-spin]="loading">{{ loading ? 'autorenew' : 'refresh' }}</span>
          {{ loading ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Screens Card -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300 overflow-hidden relative group">
          <div class="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Total Screens</p>
              <h3 class="text-3xl font-bold text-slate-800 mt-1">{{stats.totalScreens || 0}}</h3>
            </div>
            <div class="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300">
              <span class="material-icons">desktop_windows</span>
            </div>
          </div>
          <div class="mt-4">
            <div class="w-full bg-slate-100 rounded-full h-2">
              <div
                class="bg-emerald-500 h-2 rounded-full"
                [style.width.%]="stats.activeScreensPercentage || 0"
              ></div>
            </div>
            <p class="text-sm text-slate-600 mt-2 flex items-center">
              <span class="material-icons text-emerald-500 text-sm mr-1">check_circle</span>
              <span>{{stats.activeScreensPercentage || 0}}% active</span>
            </p>
          </div>
        </div>

        <!-- Total Users Card -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300 overflow-hidden relative group">
          <div class="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Total Users</p>
              <h3 class="text-3xl font-bold text-slate-800 mt-1">{{stats.totalUsers || 0}}</h3>
            </div>
            <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
              <span class="material-icons">people</span>
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm text-slate-600">
            <span class="material-icons text-blue-500 text-sm mr-1">trending_up</span>
            <span>Active platform users</span>
          </div>
        </div>

        <!-- Monthly Revenue Card -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300 overflow-hidden relative group">
          <div class="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Monthly Revenue</p>
              <h3 class="text-3xl font-bold text-slate-800 mt-1">£{{stats.revenueThisMonth || 0}}</h3>
            </div>
            <div class="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform duration-300">
              <span class="material-icons">payments</span>
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm text-slate-600">
            <span class="material-icons text-purple-500 text-sm mr-1">calendar_today</span>
            <span>Current month</span>
          </div>
        </div>

        <!-- System Status Card -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300 overflow-hidden relative group">
          <div class="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">System Status</p>
              <h3 class="text-3xl font-bold text-emerald-500 mt-1">Online</h3>
            </div>
            <div class="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300">
              <span class="material-icons">check_circle</span>
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm text-slate-600">
            <span class="material-icons text-emerald-500 text-sm mr-1">wifi</span>
            <span>All services operational</span>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Activity -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 class="text-lg font-semibold text-slate-800 flex items-center">
              <span class="material-icons mr-2 text-indigo-600">history</span>
              Recent Activity
            </h2>
            <button class="text-sm text-indigo-600 hover:text-indigo-800 flex items-center transition-colors duration-200">
              <span>View All</span>
              <span class="material-icons text-sm ml-1">arrow_forward</span>
            </button>
          </div>
          <div class="p-6">
            <app-activity-log></app-activity-log>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200">
            <h2 class="text-lg font-semibold text-slate-800 flex items-center">
              <span class="material-icons mr-2 text-indigo-600">bolt</span>
              Quick Actions
            </h2>
          </div>
          <div class="p-6 space-y-4">
            <button class="w-full bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 p-4 rounded-lg flex items-center justify-between group transition-all duration-200 shadow-sm">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3 group-hover:scale-110 transition-transform duration-300">
                  <span class="material-icons">person_add</span>
                </div>
                <span class="font-medium">Add New User</span>
              </div>
              <span class="material-icons text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-200">arrow_forward</span>
            </button>

            <button class="w-full bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 p-4 rounded-lg flex items-center justify-between group transition-all duration-200 shadow-sm">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-3 group-hover:scale-110 transition-transform duration-300">
                  <span class="material-icons">desktop_windows</span>
                </div>
                <span class="font-medium">Manage Screens</span>
              </div>
              <span class="material-icons text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-200">arrow_forward</span>
            </button>

            <button class="w-full bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700 p-4 rounded-lg flex items-center justify-between group transition-all duration-200 shadow-sm">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3 group-hover:scale-110 transition-transform duration-300">
                  <span class="material-icons">receipt_long</span>
                </div>
                <span class="font-medium">Generate Invoices</span>
              </div>
              <span class="material-icons text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-200">arrow_forward</span>
            </button>

            <button class="w-full bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 p-4 rounded-lg flex items-center justify-between group transition-all duration-200 shadow-sm">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3 group-hover:scale-110 transition-transform duration-300">
                  <span class="material-icons">analytics</span>
                </div>
                <span class="font-medium">View Reports</span>
              </div>
              <span class="material-icons text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SuperAdminDashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats = {
    totalScreens: 0,
    totalUsers: 0,
    revenueThisMonth: 0,
    activeScreensPercentage: 0
  };
  loading = false;

  private routerSubscription: Subscription | null = null;

  constructor(
    private statsService: SuperAdminStatsService,
    private router: Router
  ) {}

  ngOnInit() {
    // Initial data load
    this.loadDashboardStats();

    // Subscribe to router events to reload data when navigating to this component
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Check if we're navigating to the dashboard page
      if (event.url.includes('/super-admin/dashboard')) {
        console.log('Navigation to dashboard page detected, reloading data');
        this.loadDashboardStats();
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
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
