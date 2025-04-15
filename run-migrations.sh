#!/bin/bash

# This script runs the SQL migrations against your Supabase project

# Get the Supabase URL and key from the environment file
SUPABASE_URL=$(grep 'supabaseUrl' src/environments/environment.ts | cut -d "'" -f 2)
SUPABASE_KEY=$(grep 'supabaseKey' src/environments/environment.ts | cut -d "'" -f 2)

echo "Running migrations against Supabase project at $SUPABASE_URL"

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "Error: psql is not installed. Please install PostgreSQL client tools."
    exit 1
fi

# Run the migrations
for migration in supabase/migrations/*.sql; do
    echo "Running migration: $migration"
    
    # Use PSQL with the Supabase connection string
    # Note: This is a simplified example. In a real project, you would use the Supabase CLI
    # or a more secure method to connect to your database.
    psql "$SUPABASE_URL" -f "$migration"
    
    if [ $? -eq 0 ]; then
        echo "Migration successful: $migration"
    else
        echo "Error running migration: $migration"
        exit 1
    fi
done

echo "All migrations completed successfully!"
