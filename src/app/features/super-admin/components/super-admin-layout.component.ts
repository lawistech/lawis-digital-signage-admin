import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-super-admin-layout',
  template: `
    <div class="flex h-screen bg-slate-50 super-admin-layout">
      <!-- Sidebar -->
      <aside class="w-64 bg-white shadow-lg border-r border-slate-200 flex flex-col z-10">
        <div class="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <h1 class="text-xl font-bold flex items-center">
            <span class="material-icons mr-2">admin_panel_settings</span>
            Super Admin
          </h1>
          <p class="text-sm opacity-80 mt-1">Digital Signage Management</p>
        </div>

        <div class="flex-1 overflow-y-auto py-4">
          <nav class="px-4 space-y-1">
            <a routerLink="/super-admin/dashboard"
               routerLinkActive="bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
               [routerLinkActiveOptions]="{exact: true}"
               class="flex items-center px-4 py-3 rounded-md hover:bg-slate-50 transition-all duration-200 group">
              <span class="material-icons mr-3 group-hover:text-indigo-600">dashboard</span>
              <span class="font-medium">Dashboard</span>
            </a>

            <a routerLink="/super-admin/users"
               routerLinkActive="bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
               class="flex items-center px-4 py-3 rounded-md hover:bg-slate-50 transition-all duration-200 group">
              <span class="material-icons mr-3 group-hover:text-indigo-600">people</span>
              <span class="font-medium">Users</span>
            </a>

            <a routerLink="/super-admin/billing"
               routerLinkActive="bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
               class="flex items-center px-4 py-3 rounded-md hover:bg-slate-50 transition-all duration-200 group">
              <span class="material-icons mr-3 group-hover:text-indigo-600">payments</span>
              <span class="font-medium">Billing</span>
            </a>

            <a routerLink="/super-admin/settings"
               routerLinkActive="bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
               class="flex items-center px-4 py-3 rounded-md hover:bg-slate-50 transition-all duration-200 group">
              <span class="material-icons mr-3 group-hover:text-indigo-600">settings</span>
              <span class="font-medium">Settings</span>
            </a>
          </nav>
        </div>

        <div class="p-4 border-t border-slate-200">
          <div class="flex items-center px-4 py-3 rounded-md bg-slate-50 text-slate-700">
            <span class="material-icons mr-3 text-slate-500">info</span>
            <div class="text-sm">
              <p class="font-medium">Super Admin</p>
              <p class="text-slate-500 text-xs">v1.0.0</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Navigation -->
        <header class="bg-white shadow-sm border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-10">
          <div class="flex-1 flex items-center">
            <h2 class="text-lg font-medium text-slate-700">Digital Signage Platform</h2>
          </div>
          <div class="flex items-center space-x-4">
            <button class="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors duration-200">
              <span class="material-icons">notifications</span>
            </button>
            <button class="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors duration-200">
              <span class="material-icons">help_outline</span>
            </button>
            <div class="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
              <span class="text-sm font-medium">SA</span>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-auto bg-slate-50 p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class SuperAdminLayoutComponent {}