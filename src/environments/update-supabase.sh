#!/bin/bash

# This script updates the Supabase database with the new RPC functions for the super admin dashboard

# Check if the Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI is not installed. Please install it first."
    echo "Visit https://supabase.com/docs/guides/cli for installation instructions."
    exit 1
fi

# Get the Supabase URL and key from the environment file
SUPABASE_URL=$(grep -o 'supabaseUrl: .*' src/environments/environment.ts | cut -d "'" -f 2)
SUPABASE_KEY=$(grep -o 'supabaseKey: .*' src/environments/environment.ts | cut -d "'" -f 2)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "Could not find Supabase URL or key in environment.ts file."
    echo "Please make sure the environment.ts file contains supabaseUrl and supabaseKey."
    exit 1
fi

echo "Found Supabase URL: $SUPABASE_URL"
echo "Found Supabase key: ${SUPABASE_KEY:0:10}..."

# Ask for confirmation
echo "This script will update the Supabase database with new RPC functions for the super admin dashboard."
echo "Make sure you have a backup of your database before proceeding."
read -p "Do you want to continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 1
fi

# Run the SQL commands
echo "Updating Supabase database..."
cat src/environments/updated-supabase.sql | curl -X POST \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -d @- \
    "$SUPABASE_URL/rest/v1/rpc/exec_sql"

if [ $? -eq 0 ]; then
    echo "Supabase database updated successfully!"
else
    echo "Failed to update Supabase database."
    echo "Please check your Supabase URL and key, and make sure the SQL commands are valid."
    exit 1
fi

echo "Done!"
