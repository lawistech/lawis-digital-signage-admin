#!/bin/bash

# This script sets up the subscription_pans table in Supabase

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

# Create the subscription_pans table
echo "Creating subscription_pans table..."

CREATE_TABLE_SQL=$(cat << 'EOF'
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
EOF
)

# Execute the SQL commands
RESPONSE=$(curl -s -X POST \
  "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"$CREATE_TABLE_SQL\"}")

# Check if the request was successful
if [[ $RESPONSE == *"error"* ]]; then
  echo "Error creating subscription_pans table:"
  echo "$RESPONSE"
  exit 1
else
  echo "subscription_pans table created successfully!"
  echo ""
  echo "Testing the subscription_pans table..."
  
  # Test querying the subscription_pans table
  echo "Querying subscription_pans table..."
  PLANS_RESPONSE=$(curl -s -X GET \
    "$SUPABASE_URL/rest/v1/subscription_pans?select=*" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY")
  
  if [[ $PLANS_RESPONSE == *"error"* ]]; then
    echo "Error querying subscription_pans table:"
    echo "$PLANS_RESPONSE"
  else
    PLANS_COUNT=$(echo "$PLANS_RESPONSE" | grep -o "id" | wc -l)
    echo "subscription_pans table is working correctly!"
    echo "Found $PLANS_COUNT subscription plans."
    echo ""
    echo "Setup completed successfully!"
  fi
fi
