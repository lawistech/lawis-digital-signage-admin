#!/bin/bash

# This script runs the SQL commands to fix the subscription plans functionality

# Check if SUPABASE_URL and SUPABASE_KEY are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "Error: SUPABASE_URL and SUPABASE_KEY environment variables must be set."
  echo "You can find these values in your Supabase project settings."
  echo ""
  echo "Example:"
  echo "export SUPABASE_URL=https://your-project-id.supabase.co"
  echo "export SUPABASE_KEY=your-service-role-key"
  exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  echo "Error: jq is required but not installed. Please install jq and try again."
  exit 1
fi

# Read the SQL file
SQL_FILE="subscription-plans-fixed.sql"
if [ ! -f "$SQL_FILE" ]; then
  echo "Error: $SQL_FILE not found."
  exit 1
fi

SQL_CONTENT=$(cat "$SQL_FILE")

echo "Fixing subscription plans..."
echo "Executing SQL commands..."

# Execute the SQL commands
RESPONSE=$(curl -s -X POST \
  "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"$SQL_CONTENT\"}")

# Check if the request was successful
if [[ $RESPONSE == *"error"* ]]; then
  echo "Error executing SQL commands:"
  echo "$RESPONSE" | jq .
  exit 1
else
  echo "SQL commands executed successfully!"
  echo ""
  echo "Testing the subscription plans functionality..."
  
  # Test get_subscription_plans
  echo "Testing get_subscription_plans..."
  PLANS_RESPONSE=$(curl -s -X POST \
    "$SUPABASE_URL/rest/v1/rpc/get_subscription_plans" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Content-Type: application/json")
  
  if [[ $PLANS_RESPONSE == *"error"* ]]; then
    echo "Error testing get_subscription_plans:"
    echo "$PLANS_RESPONSE" | jq .
  else
    echo "get_subscription_plans is working correctly!"
    echo "Found $(echo "$PLANS_RESPONSE" | jq '. | length') subscription plans."
  fi
  
  echo ""
  echo "Fix completed successfully!"
  echo "You should now be able to manage subscription plans in the Super Admin section."
fi
