# Subscription Plans Functionality

This document provides information on how to use the subscription plans functionality in the Super Admin section.

## Overview

The subscription plans functionality allows super admins to:

1. View all subscription plans
2. Add new subscription plans
3. Edit existing subscription plans
4. Delete subscription plans

## Prerequisites

Make sure you have Angular Material properly installed and configured in your project. If you encounter any issues with Angular Material, refer to the `README-ANGULAR-MATERIAL.md` file in the root directory.

## How to Use

### Viewing Subscription Plans

1. Navigate to the Super Admin section
2. Click on "Settings" in the sidebar
3. The subscription plans are displayed in the right sidebar

### Adding a New Subscription Plan

1. Click the "Add New Plan" button at the bottom of the subscription plans section
2. Fill in the required fields:
   - Plan Name (required)
   - Price (required)
   - Maximum Screens (required)
   - Maximum Users (required)
   - Description (optional)
   - Features (optional)
   - Mark as Popular (optional)
   - Plan is Active (optional)
3. Click "Save Plan" to add the new plan

### Editing a Subscription Plan

1. Click the "Edit" button next to the plan you want to edit
2. Modify the fields as needed
3. Click "Save Plan" to update the plan

### Deleting a Subscription Plan

1. Click the "Delete" button next to the plan you want to delete
2. Confirm the deletion in the confirmation dialog
3. The plan will be removed from the list

## Technical Details

### Components

- `SettingsComponent`: The main component that displays the settings page, including subscription plans
- `EditPlanDialogComponent`: A dialog component for adding and editing subscription plans

### Services

- `SuperAdminStatsService`: Contains methods for managing subscription plans:
  - `getSubscriptionPlans()`: Retrieves all subscription plans
  - `addSubscriptionPlan(planData)`: Adds a new subscription plan
  - `updateSubscriptionPlan(planId, planData)`: Updates an existing subscription plan
  - `deleteSubscriptionPlan(planId)`: Deletes a subscription plan

### Models

- `SubscriptionPlan`: Interface that defines the structure of a subscription plan:
  ```typescript
  interface SubscriptionPlan {
    id?: string;
    name: string;
    price: number;
    max_screens: number;
    max_users: number;
    description?: string;
    features?: string[];
    is_popular?: boolean;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
  }
  ```

## Troubleshooting

### Common Issues

1. **Dialog doesn't open**: Make sure Angular Material is properly installed and the MatDialogModule is imported in your module.

2. **Form validation errors**: Check that all required fields are filled in before submitting the form.

3. **API errors**: Check the browser console for detailed error messages. The most common issues are:
   - Missing required fields
   - Invalid data types
   - Network connectivity issues

### Solutions

1. If Angular Material is not working, run the installation script:
   ```bash
   ./install-material.sh
   ```

2. If you encounter API errors, check the Supabase database setup:
   - Make sure the `subscription_plans` table exists
   - Verify that the RPC functions are properly defined
   - Check the Supabase logs for any errors

## Database Setup

The subscription plans functionality requires a `subscription_plans` table and several RPC functions to be added to your Supabase database. Refer to the `subscription-plans.sql` file in the `environments` directory for the SQL commands to set up the database.
