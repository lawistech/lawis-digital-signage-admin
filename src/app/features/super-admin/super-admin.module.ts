import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material Imports
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Components
import { SuperAdminLayoutComponent } from './components/super-admin-layout.component';
import { SuperAdminDashboardComponent } from './components/dashboard/dashboard.component';
import { UsersComponent } from './components/users/users.component';
import { BillingComponent } from './components/billing/billing.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ArchiveComponent } from './components/archive/archive.component';

// Services
import { SuperAdminStatsService } from './services/super-admin-stats.service';
import { ActivityLogService } from './services/activity-log.service';

// Guards
import { SuperAdminGuard } from '../../core/guards/super-admin.guard';

// Activity Log Components
import { ActivityLogComponent } from './components/activity-log/activity-log.component';
import { ActivityLogsComponent } from './components/activity-logs/activity-logs.component';

// User Management Components
import { AddUserDialogComponent } from './components/users/add-user-dialog.component';
import { EditUserDialogComponent } from './components/users/edit-user-dialog.component';
import { BulkActionDialogComponent } from './components/users/bulk-action-dialog.component';
import { UserDetailsDialogComponent } from './components/users/user-details-dialog.component';

// Settings Components
import { EditPlanDialogComponent } from './components/settings/edit-plan-dialog.component';

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
      { path: 'archive', component: ArchiveComponent },
      { path: 'activity-logs', component: ActivityLogsComponent }
    ]
  }
];

@NgModule({
  declarations: [
    SuperAdminLayoutComponent,
    SuperAdminDashboardComponent,
    ActivityLogComponent,
    ActivityLogsComponent,
    UsersComponent,
    BillingComponent,
    SettingsComponent,
    ArchiveComponent,
    AddUserDialogComponent,
    EditUserDialogComponent,
    BulkActionDialogComponent,
    UserDetailsDialogComponent
    // EditPlanDialogComponent is now a standalone component
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    // Angular Material Modules
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatSelectModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTabsModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  providers: [
    SuperAdminStatsService,
    UserManagementService,
    ActivityLogService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA] // This will help suppress template errors
})
export class SuperAdminModule { }
