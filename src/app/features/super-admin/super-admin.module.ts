import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Components
import { SuperAdminLayoutComponent } from './components/super-admin-layout.component';
import { SuperAdminDashboardComponent } from './components/dashboard/dashboard.component';
import { UsersComponent } from './components/users/users.component';
import { BillingComponent } from './components/billing/billing.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ArchiveComponent } from './components/archive/archive.component';

// Services
import { SuperAdminStatsService } from './services/super-admin-stats.service';

// Guards
import { SuperAdminGuard } from '../../core/guards/super-admin.guard';

// Activity Log Component
import { ActivityLogComponent } from './components/activity-log/activity-log.component';

// User Management Components
import { AddUserDialogComponent } from './components/users/add-user-dialog.component';
import { EditUserDialogComponent } from './components/users/edit-user-dialog.component';
import { BulkActionDialogComponent } from './components/users/bulk-action-dialog.component';
import { UserDetailsDialogComponent } from './components/users/user-details-dialog.component';

// Additional Services
import { UserManagementService } from './services/user-management.service';

const routes: Routes = [
  {
    path: '',
    component: SuperAdminLayoutComponent,
    canActivate: [SuperAdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: SuperAdminDashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'billing', component: BillingComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'archive', component: ArchiveComponent }
    ]
  }
];

@NgModule({
  declarations: [
    SuperAdminLayoutComponent,
    SuperAdminDashboardComponent,
    ActivityLogComponent,
    UsersComponent,
    BillingComponent,
    SettingsComponent,
    ArchiveComponent,
    AddUserDialogComponent,
    EditUserDialogComponent,
    BulkActionDialogComponent,
    UserDetailsDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    SuperAdminStatsService,
    UserManagementService
  ]
})
export class SuperAdminModule { }
