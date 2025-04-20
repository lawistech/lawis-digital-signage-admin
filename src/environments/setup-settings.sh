#!/bin/bash

# This script helps set up the system settings functionality for the Super Admin section

# Check if SUPABASE_URL and SUPABASE_KEY are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "Error: SUPABASE_URL and SUPABASE_KEY environment variables must be set."
  echo "You can find these values in your Supabase dashboard under Project Settings > API."
  echo ""
  echo "Example usage:"
  echo "SUPABASE_URL=https://your-project-id.supabase.co SUPABASE_KEY=your-anon-key ./setup-settings.sh"
  exit 1
fi

# Check if curl is installed
if ! command -v curl &> /dev/null; then
  echo "Error: curl is required but not installed. Please install curl and try again."
  exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  echo "Error: jq is required but not installed. Please install jq and try again."
  exit 1
fi

# Read the SQL file
SQL_FILE="system-settings.sql"
if [ ! -f "$SQL_FILE" ]; then
  echo "Error: $SQL_FILE not found."
  exit 1
fi

SQL_CONTENT=$(cat "$SQL_FILE")

echo "Setting up system settings..."
echo "Executing SQL commands..."

# Execute the SQL commands
RESPONSE=$(curl -s -X POST \
  "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"$SQL_CONTENT\"}")

# Check if there was an error
if echo "$RESPONSE" | jq -e '.error' > /dev/null; then
  ERROR=$(echo "$RESPONSE" | jq -r '.error.message')
  echo "Error executing SQL commands: $ERROR"
  exit 1
fi

echo "SQL commands executed successfully."
echo "Testing get_system_settings function..."

# Test the get_system_settings function
RESPONSE=$(curl -s -X POST \
  "$SUPABASE_URL/rest/v1/rpc/get_system_settings" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json")

# Check if there was an error
if echo "$RESPONSE" | jq -e '.error' > /dev/null; then
  ERROR=$(echo "$RESPONSE" | jq -r '.error.message')
  echo "Error testing get_system_settings: $ERROR"
  exit 1
fi

echo "get_system_settings function is working correctly."
echo "Current settings:"
echo "$RESPONSE" | jq

echo "Setup completed successfully."
