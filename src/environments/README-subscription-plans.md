# Setting Up Subscription Plans

This document provides instructions on how to set up the subscription plans functionality for the Super Admin section.

## Database Setup

The subscription plans functionality requires a `subscription_plans` table and several RPC functions to be added to your Supabase database.

### Option 1: Using the SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `subscription-plans.sql` and paste it into the SQL Editor
4. Run the SQL commands

### Option 2: Using Migrations

If you're using Supabase migrations:

1. Copy the contents of `subscription-plans.sql` to a new migration file in the `supabase/migrations` directory
2. Run the migration using the Supabase CLI:

```bash
supabase db push
```

### Option 3: Using the Setup Script

If you have curl and jq installed, you can use the provided setup script:

```bash
export SUPABASE_URL=https://your-project-id.supabase.co
export SUPABASE_KEY=your-anon-key
./setup-subscription-plans.sh
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Make sure your user has the necessary permissions to create tables and functions.
2. **Function Already Exists**: If you get an error about functions already existing, you can safely ignore it as the script uses `CREATE OR REPLACE`.
3. **Table Already Exists**: If the table already exists, the script will not recreate it.

### Testing the Functions

You can test the functions directly in the SQL Editor:

```sql
-- Test get_subscription_plans
SELECT get_subscription_plans();

-- Test add_subscription_plan
SELECT add_subscription_plan(
  '{"name": "Enterprise", "price": 199.99, "max_screens": 50, "max_users": 100, "description": "For large organizations", "features": ["Unlimited storage", "24/7 support", "Custom integrations"]}'::json
);

-- Test update_subscription_plan
SELECT update_subscription_plan(
  'plan-id-here',
  '{"price": 249.99, "is_popular": true}'::json
);

-- Test delete_subscription_plan
SELECT delete_subscription_plan('plan-id-here');
```

## Verifying the Setup

After setting up the database, you can verify that everything is working correctly by:

1. Navigating to the Super Admin section in the application
2. Going to the Settings page
3. Checking if the subscription plans are loaded correctly
4. Trying to add, edit, and delete subscription plans

If you encounter any issues, check the browser console for error messages.
