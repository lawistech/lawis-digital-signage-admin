# Using the subscription_pans Table for Subscription Plans

This document provides instructions on how to use the `subscription_pans` table for subscription plans in the Super Admin section.

## Overview

The subscription plans functionality in the Super Admin section has been updated to use the `subscription_pans` table instead of the `subscription_plans` table. This change ensures that the UI accurately reflects what's in your database.

## Setting Up the subscription_pans Table

### Option 1: Using the Setup Script

1. Set your Supabase URL and API key as environment variables:
   ```bash
   export SUPABASE_URL=https://your-project-id.supabase.co
   export SUPABASE_KEY=your-service-role-key
   ```

2. Run the setup script:
   ```bash
   ./setup-subscription-plans.sh
   ```

### Option 2: Using the Supabase SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `src/environments/setup-subscription-pans.sql` and paste it into the SQL Editor
4. Run the SQL commands

## Default Subscription Plans

The SQL script will create the following default subscription plans in the `subscription_pans` table if they don't already exist:

1. **Basic**: £9.99/month, 1 screen, 2 users
2. **Standard**: £29.99/month, 5 screens, 10 users (marked as popular)
3. **Premium**: £99.99/month, 20 screens, 50 users

## Verifying the Setup

After running the setup script or SQL commands, you should be able to:

1. Navigate to the Super Admin section
2. Go to the Settings page
3. See the subscription plans loaded from the `subscription_pans` table

If you don't see any plans, it means either:
- The SQL commands failed to execute
- The RPC functions are not working properly
- There are no subscription plans in your `subscription_pans` table

## Troubleshooting

If you encounter issues:

1. Check the browser console for error messages
2. Verify that the SQL commands were executed successfully
3. Test the RPC functions directly using the Supabase dashboard
4. Make sure your Supabase URL and API key are correct

## Adding Custom Plans

You can add custom subscription plans by:

1. Using the "Add New Plan" button in the Super Admin Settings page
2. Or by inserting records directly into the `subscription_pans` table in Supabase

## Important Notes

- The subscription plans are used throughout the application, including in the user management section
- When you delete a subscription plan, make sure it's not being used by any organizations
- Changes to subscription plans are immediately reflected in the UI
- The application now uses the following RPC functions:
  - `get_subscription_plans_from_pans`
  - `update_subscription_plan_in_pans`
  - `add_subscription_plan_to_pans`
  - `delete_subscription_plan_from_pans`
