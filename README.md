# Digital Signage Admin Dashboard

This is the admin dashboard for the Digital Signage platform.

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   ng serve
   ```

3. Open your browser and navigate to `http://localhost:4200`

## Database Setup

The application requires several database functions to be set up in Supabase. You can run the migrations using the provided script:

```
chmod +x run-migrations.sh
./run-migrations.sh
```

Alternatively, you can manually run the SQL files in the `supabase/migrations` directory against your Supabase database.

## Troubleshooting Dashboard Issues

If you encounter issues with the dashboard:

1. Check that your Supabase URL and key are correctly set in `src/environments/environment.ts`
2. Ensure that the required database functions are set up (see Database Setup)
3. Check the browser console for any errors
4. Make sure you have the correct user role (super_admin) to access the dashboard

## Features

- Super Admin Dashboard
- User Management
- Billing Management
- System Settings

## Development

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.11.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
