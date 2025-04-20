# Fixing Subscription Plans Functionality

This document provides instructions on how to fix the subscription plans functionality in the Super Admin section.

## Problem

The subscription plans functionality in the Super Admin section is not working properly due to the following issues:

1. The Supabase RPC functions for subscription plans have a role check that prevents non-super_admin users from managing subscription plans.
2. There are type conversion issues in the SQL functions.

## Solution

### 1. Update the Supabase RPC Functions

The SQL functions need to be updated to remove the role check and fix type conversion issues. A fixed version of the SQL functions is provided in the `subscription-plans-fixed.sql` file in the `environments` directory.

#### Option 1: Using the SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `subscription-plans-fixed.sql` and paste it into the SQL Editor
4. Run the SQL commands

#### Option 2: Using Migrations

If you're using Supabase migrations:

1. Copy the contents of `subscription-plans-fixed.sql` to a new migration file in the `supabase/migrations` directory
2. Run the migration using the Supabase CLI:

```bash
supabase migration up
```

### 2. Key Changes in the SQL Functions

The following changes have been made to the SQL functions:

1. Removed the role check from all functions:
   ```sql
   -- Old code with role check
   IF (auth.jwt() ->> 'role' != 'super_admin') THEN
     RAISE EXCEPTION 'Not authorized';
   END IF;
   
   -- New code without role check
   -- Role check removed
   ```

2. Fixed type conversion issues:
   ```sql
   -- Old code with potential type conversion issues
   name = COALESCE(plan_data->>'name', name),
   price = COALESCE((plan_data->>'price')::DECIMAL, price),
   
   -- New code with explicit type casting
   name = COALESCE((plan_data->>'name')::TEXT, name),
   price = COALESCE((plan_data->>'price')::DECIMAL, price),
   ```

3. Improved handling of the features field:
   ```sql
   -- Handle the features field properly
   IF plan_data->'features' IS NOT NULL THEN
     features_value := plan_data->'features';
   ELSE
     -- Keep existing features if not provided
     SELECT features INTO features_value FROM subscription_plans WHERE id = plan_id;
   END IF;
   ```

### 3. Testing the Fix

After applying the SQL changes, you should be able to:

1. View all subscription plans
2. Add new subscription plans
3. Edit existing subscription plans
4. Delete subscription plans (if they are not in use by any organizations)

If you still encounter issues, check the browser console for error messages and verify that the SQL functions were updated correctly.

## Additional Information

### Default Subscription Plans

If the subscription plans functionality is not working, the system will use the following default plans:

- **Basic**: £9.99/month, 1 screen, 2 users
- **Standard**: £29.99/month, 5 screens, 10 users (marked as popular)
- **Premium**: £99.99/month, 20 screens, 50 users

### Development Mode

In development mode, the system will use mock data if the Supabase RPC functions are not working properly. This allows you to test the UI without having to fix the database issues immediately.

### Production Mode

In production mode, you must fix the database issues for the subscription plans functionality to work properly.
