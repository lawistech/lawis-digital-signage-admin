# Using the subscription_pans Table Directly for Subscription Plans

This document provides instructions on how to use the `subscription_pans` table directly for subscription plans in the Super Admin section, without using Supabase RPC functions.

## Overview

The subscription plans functionality in the Super Admin section has been updated to directly query the `subscription_pans` table instead of using RPC functions. This change ensures that the UI accurately reflects what's in your database and simplifies the implementation.

## Setting Up the subscription_pans Table

### Option 1: Using the Setup Script

1. Set your Supabase URL and API key as environment variables:
   ```bash
   export SUPABASE_URL=https://your-project-id.supabase.co
   export SUPABASE_KEY=your-service-role-key
   ```

2. Run the setup script:
   ```bash
   ./setup-subscription-pans.sh
   ```

### Option 2: Using the Supabase SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the following SQL commands and paste them into the SQL Editor:

```sql
-- Create the subscription_pans table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_pans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  max_screens INTEGER NOT NULL,
  max_users INTEGER NOT NULL,
  description TEXT,
  features JSONB DEFAULT '[]',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_subscription_pans'
  ) THEN
    CREATE OR REPLACE FUNCTION update_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER set_timestamp_subscription_pans
    BEFORE UPDATE ON subscription_pans
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
  END IF;
END $$;

-- Insert default plans if the table is empty
INSERT INTO subscription_pans (name, price, max_screens, max_users, description, features, is_popular)
SELECT 'Basic', 9.99, 1, 2, 'Basic features for small deployments', '["Basic content scheduling", "Standard support"]', false
WHERE NOT EXISTS (SELECT 1 FROM subscription_pans WHERE name = 'Basic');

INSERT INTO subscription_pans (name, price, max_screens, max_users, description, features, is_popular)
SELECT 'Standard', 29.99, 5, 10, 'Advanced features for growing businesses', '["Advanced scheduling", "Priority support", "Content templates"]', true
WHERE NOT EXISTS (SELECT 1 FROM subscription_pans WHERE name = 'Standard');

INSERT INTO subscription_pans (name, price, max_screens, max_users, description, features, is_popular)
SELECT 'Premium', 99.99, 20, 50, 'Full features for large-scale deployments', '["Custom branding", "API access", "Advanced analytics", "Dedicated support"]', false
WHERE NOT EXISTS (SELECT 1 FROM subscription_pans WHERE name = 'Premium');
```

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
- There are no subscription plans in your `subscription_pans` table
- There's an issue with the Supabase connection

## Troubleshooting

If you encounter issues:

1. Check the browser console for error messages
2. Verify that the SQL commands were executed successfully
3. Test querying the table directly using the Supabase dashboard
4. Make sure your Supabase URL and API key are correct

## Adding Custom Plans

You can add custom subscription plans by:

1. Using the "Add New Plan" button in the Super Admin Settings page
2. Or by inserting records directly into the `subscription_pans` table in Supabase

## Important Notes

- The subscription plans are used throughout the application, including in the user management section
- When you delete a subscription plan, make sure it's not being used by any organizations
- Changes to subscription plans are immediately reflected in the UI
- The application now directly queries the `subscription_pans` table instead of using RPC functions
- The features field is stored as a JSONB array in the database
