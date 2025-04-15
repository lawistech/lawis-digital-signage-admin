import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-super-admin-layout',
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <aside class="w-64 bg-white shadow-sm">
        <div class="p-6 border-b">
          <h1 class="text-xl font-bold text-gray-800">Super Admin</h1>
          <p class="text-sm text-gray-500">Digital Signage Management</p>
        </div>

        <nav class="p-4 space-y-2">
          <a routerLink="/super-admin/dashboard"
             routerLinkActive="bg-blue-50 text-blue-600"
             class="flex items-center px-4 py-2 rounded-lg hover:bg-gray-50">
            <span class="material-icons mr-3">dashboard</span>
            Dashboard
          </a>



          <a routerLink="/super-admin/users"
             routerLinkActive="bg-blue-50 text-blue-600"
             class="flex items-center px-4 py-2 rounded-lg hover:bg-gray-50">
            <span class="material-icons mr-3">people</span>
            Users
          </a>

          <a routerLink="/super-admin/billing"
             routerLinkActive="bg-blue-50 text-blue-600"
             class="flex items-center px-4 py-2 rounded-lg hover:bg-gray-50">
            <span class="material-icons mr-3">payments</span>
            Billing
          </a>

          <a routerLink="/super-admin/settings"
             routerLinkActive="bg-blue-50 text-blue-600"
             class="flex items-center px-4 py-2 rounded-lg hover:bg-gray-50">
            <span class="material-icons mr-3">settings</span>
            Settings
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-auto">
        <div class="p-6">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class SuperAdminLayoutComponent {}