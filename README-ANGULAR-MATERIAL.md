# Angular Material Installation Guide

This document provides instructions on how to install Angular Material and fix the issues with the subscription plans functionality in the Super Admin section.

## Installation Steps

### 1. Install Angular Material

Run the provided script to install Angular Material and its dependencies:

```bash
./install-material.sh
```

Or manually install the required packages:

```bash
npm install @angular/material @angular/cdk @angular/animations
```

### 2. Import Angular Material Modules

After installing Angular Material, you need to update the `super-admin.module.ts` file to import the necessary modules:

1. Uncomment the Angular Material imports at the top of the file:
```typescript
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
```

2. Add the Angular Material modules to the imports array:
```typescript
imports: [
  CommonModule,
  ReactiveFormsModule,
  FormsModule,
  RouterModule.forChild(routes),
  MatDialogModule,
  MatButtonModule,
  MatInputModule,
  MatFormFieldModule,
  MatCheckboxModule,
  MatSelectModule
],
```

### 3. Enable the Subscription Plan Dialog

1. Uncomment the EditPlanDialogComponent import:
```typescript
import { EditPlanDialogComponent } from './components/settings/edit-plan-dialog.component';
```

2. Add EditPlanDialogComponent to the declarations array:
```typescript
declarations: [
  // ... other components
  EditPlanDialogComponent
],
```

3. Update the SettingsComponent to use the dialog:
```typescript
import { MatDialog } from '@angular/material/dialog';
```

4. Uncomment the dialog in the constructor:
```typescript
constructor(
  private fb: FormBuilder,
  private statsService: SuperAdminStatsService,
  private dialog: MatDialog
) {
```

5. Uncomment the openEditPlanDialog method:
```typescript
openEditPlanDialog(plan?: SubscriptionPlan) {
  const dialogRef = this.dialog.open(EditPlanDialogComponent, {
    width: '600px',
    data: { plan: plan ? {...plan} : {} }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      if (result.id) {
        // Update existing plan
        this.updateSubscriptionPlan(result.id, result);
      } else {
        // Add new plan
        this.addSubscriptionPlan(result);
      }
    }
  });
}
```

### 4. Add Angular Material Theme

Add an Angular Material theme to your `styles.css` or `angular.json` file:

```css
@import '@angular/material/prebuilt-themes/indigo-pink.css';
```

Or add it to the `angular.json` file in the `styles` array:

```json
"styles": [
  "src/styles.css",
  "node_modules/@angular/material/prebuilt-themes/indigo-pink.css"
],
```

## Troubleshooting

If you encounter any issues after following these steps, try the following:

1. Clear the Angular cache:
```bash
ng cache clean
```

2. Restart the development server:
```bash
ng serve
```

3. If you still have issues, try reinstalling the node modules:
```bash
rm -rf node_modules
npm install
```
