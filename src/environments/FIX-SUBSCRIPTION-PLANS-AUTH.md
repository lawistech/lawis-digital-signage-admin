# Fixing Subscription Plans Issues

This guide will help you fix issues with the subscription plans functionality, including authorization errors and type conversion problems.

## Issues

### 1. Authorization Issue

The current SQL functions for subscription plans have a role check that requires the user to have a 'super_admin' role in their JWT token. If your user doesn't have this role, you'll get a "Not authorized" error when trying to use these functions.

### 2. Type Conversion Issue

There's also a type conversion issue with the features field. The error "COALESCE could not convert type jsonb to json" occurs because of a mismatch between jsonb and json types in the SQL functions.

## Solutions

We need to update the SQL functions to fix both issues. Here are the options:

### Option 1: Update the SQL Functions (Recommended)

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `subscription-plans-updated.sql` and paste it into the SQL Editor
4. Run the SQL commands

This will:
- Update the existing functions to remove the role check
- Fix the type conversion issue with the features field
- Grant the necessary permissions to authenticated users

### Option 2: Assign the 'super_admin' Role to Your User

If you prefer to keep the role check for security reasons, you can assign the 'super_admin' role to your user:

1. Log in to your Supabase dashboard
2. Navigate to Authentication > Users
3. Find your user and click on it
4. In the user details panel, add a custom claim:
   - Key: `role`
   - Value: `super_admin`
5. Save the changes

## Testing the Fix

After applying one of the solutions above, you should be able to:
1. Add new subscription plans
2. Edit existing plans
3. Delete plans (if they're not in use by any organizations)

## Security Considerations

If you choose Option 1 (removing the role check), be aware that any authenticated user will be able to manage subscription plans. In a production environment, you should implement proper authorization checks to restrict access to these functions.

## Troubleshooting

### Common Errors

1. **"Not authorized"** - This means your user doesn't have the required role. Use Option 1 or Option 2 above to fix this.

2. **"COALESCE could not convert type jsonb to json"** - This is a type conversion issue. Use Option 1 to fix this by updating the SQL functions.

3. **"Cannot delete plan that is in use by organizations"** - This means the plan you're trying to delete is currently assigned to one or more organizations. You need to reassign those organizations to a different plan before deleting this one.

If you still encounter issues after applying the fixes:

1. Check the browser console for detailed error messages
2. Verify that the SQL functions were updated successfully
3. Make sure your user is authenticated
4. Check the Supabase logs for any errors

If the issue persists, you may need to:
1. Restart your Supabase project
2. Clear your browser cache
3. Sign out and sign back in to refresh your JWT token
