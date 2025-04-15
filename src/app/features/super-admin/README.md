# Super Admin Module

This module provides super admin functionality for the Digital Signage Platform. It allows super admins to manage users, organizations, billing, and system settings.

## Features

- **Dashboard**: View key statistics about the platform, including total screens, total users, and monthly revenue.
- **User Management**: View, create, edit, and delete users. Assign roles and organizations to users.
- **Billing Management**: View and manage billing records, generate invoices, and export reports.
- **Settings**: Configure system-wide settings, subscription plans, and email templates.

## Setup

### 1. Update Supabase Database

The super admin functionality requires several RPC functions to be added to your Supabase database. You can add these functions by running the provided script:

```bash
cd lawis-admin-digital-signage
./src/environments/update-supabase.sh
```

Alternatively, you can manually run the SQL commands in `src/environments/updated-supabase.sql` in your Supabase SQL editor.

### 2. Create a Super Admin User

To create a super admin user, you need to update the user's metadata in the Supabase Auth dashboard:

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Find the user you want to make a super admin
4. Click on the user to edit their details
5. In the metadata section, add or update the `role` field to `super_admin`
6. Save the changes

Example metadata:
```json
{
  "role": "super_admin"
}
```

## Usage

Once you have set up the super admin functionality, you can access it by navigating to `/super-admin` in your application. Only users with the `super_admin` role will be able to access this route.

### Dashboard

The dashboard provides an overview of the platform's key metrics:

- Total screens
- Active screens percentage
- Total users
- Monthly revenue
- Recent activity

### User Management

The user management page allows you to:

- View all users in the system
- Filter users by role or organization
- Create new users
- Edit existing users
- Delete users

### Billing Management

The billing management page allows you to:

- View all billing records
- Filter records by status or organization
- Generate invoices
- Mark invoices as paid
- Export billing reports

### Settings

The settings page allows you to configure:

- System name
- Support email
- Default timezone
- Maintenance mode
- Subscription plans
- Email templates

## Development

### Adding New Features

To add new features to the super admin module:

1. Create a new component in the `components` directory
2. Add the component to the `SuperAdminModule` declarations
3. Add a route for the component in the `routes` array in `super-admin.module.ts`
4. Add a link to the component in the `super-admin-layout.component.ts` template

### Adding New RPC Functions

To add new RPC functions:

1. Add the function to `src/environments/updated-supabase.sql`
2. Add a method to call the function in `super-admin-stats.service.ts`
3. Use the method in your component

## Troubleshooting

### Access Issues

If you're having trouble accessing the super admin functionality:

1. Make sure the user has the `super_admin` role in their metadata
2. Check the browser console for any errors
3. Verify that the RPC functions have been added to your Supabase database

### Data Issues

If you're not seeing the expected data:

1. Check the browser console for any errors
2. Verify that the RPC functions are returning the expected data
3. Make sure the tables in your Supabase database have the expected structure

## License

This module is part of the Digital Signage Platform and is subject to the same license as the rest of the application.
