# Setting Up System Settings

This document provides instructions on how to set up the system settings functionality for the Super Admin section.

## Database Setup

The system settings functionality requires a `system_settings` table and two RPC functions to be added to your Supabase database.

### Option 1: Using the SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `system-settings.sql` and paste it into the SQL Editor
4. Run the SQL commands

### Option 2: Using Migrations

If you're using Supabase migrations:

1. Copy the contents of `system-settings.sql` to a new migration file in the `supabase/migrations` directory
2. Run the migration using the Supabase CLI:

```bash
supabase db push
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Make sure your user has the necessary permissions to create tables and functions.
2. **Function Already Exists**: If you get an error about functions already existing, you can safely ignore it as the script uses `CREATE OR REPLACE`.
3. **Table Already Exists**: If the table already exists, the script will not recreate it.

### Testing the Functions

You can test the functions directly in the SQL Editor:

```sql
-- Test get_system_settings
SELECT get_system_settings();

-- Test update_system_settings
SELECT update_system_settings(
  '{"system_name": "My Digital Signage", "support_email": "support@mycompany.com"}'::json
);
```

## Verifying the Setup

After setting up the database, you can verify that everything is working correctly by:

1. Navigating to the Super Admin section in the application
2. Going to the Settings page
3. Checking if the settings are loaded correctly
4. Making changes and saving them
5. Refreshing the page to see if the changes persist

If you encounter any issues, check the browser console for error messages.
