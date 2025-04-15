-- Create the activity_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create the get_screen_stats function
CREATE OR REPLACE FUNCTION get_screen_stats()
RETURNS JSON AS $$
DECLARE
  total_screens INTEGER;
  active_screens INTEGER;
  total_users INTEGER;
BEGIN
  -- Count total users
  SELECT COUNT(*) INTO total_users FROM profiles;
  
  -- For demo purposes, we'll simulate screen counts
  -- In a real application, you would query your actual screens table
  total_screens := total_users * 3; -- Assume each user has about 3 screens on average
  active_screens := total_screens * 0.8; -- Assume 80% of screens are active
  
  RETURN json_build_object(
    'total', total_screens,
    'active', active_screens,
    'totalUsers', total_users
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the get_revenue_stats function
CREATE OR REPLACE FUNCTION get_revenue_stats()
RETURNS JSON AS $$
DECLARE
  monthly_revenue DECIMAL;
  total_users INTEGER;
BEGIN
  -- Count total users
  SELECT COUNT(*) INTO total_users FROM profiles;
  
  -- For demo purposes, we'll simulate revenue
  -- In a real application, you would query your actual billing/subscription tables
  monthly_revenue := total_users * 29.99; -- Assume average subscription is $29.99
  
  RETURN json_build_object(
    'monthly', monthly_revenue
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the get_billing_summary function
CREATE OR REPLACE FUNCTION get_billing_summary()
RETURNS JSON AS $$
DECLARE
  total_revenue DECIMAL;
  outstanding_amount DECIMAL;
  active_subscriptions INTEGER;
  total_users INTEGER;
BEGIN
  -- Count total users
  SELECT COUNT(*) INTO total_users FROM profiles;
  
  -- For demo purposes, we'll simulate billing data
  -- In a real application, you would query your actual billing/subscription tables
  active_subscriptions := total_users * 0.7; -- Assume 70% of users have active subscriptions
  total_revenue := active_subscriptions * 29.99 * 6; -- 6 months of revenue at $29.99
  outstanding_amount := active_subscriptions * 29.99 * 0.2; -- 20% of monthly revenue is outstanding
  
  RETURN json_build_object(
    'totalRevenue', total_revenue,
    'outstandingAmount', outstanding_amount,
    'activeSubscriptions', active_subscriptions
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the get_billing_records function
CREATE OR REPLACE FUNCTION get_billing_records(page_number INTEGER, page_size INTEGER)
RETURNS JSON AS $$
DECLARE
  records JSON;
  total_count INTEGER;
  total_users INTEGER;
  offset_val INTEGER;
BEGIN
  -- Count total users
  SELECT COUNT(*) INTO total_users FROM profiles;
  
  -- Calculate offset
  offset_val := (page_number - 1) * page_size;
  
  -- For demo purposes, we'll generate mock billing records
  -- In a real application, you would query your actual billing/invoice tables
  WITH user_data AS (
    SELECT 
      id, 
      email, 
      organization_id,
      ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num
    FROM profiles
    LIMIT page_size OFFSET offset_val
  ),
  billing_data AS (
    SELECT
      gen_random_uuid() as id,
      u.id as user_id,
      u.email as user_email,
      u.organization_id,
      'Organization ' || u.row_num as organization_name,
      (random() * 100 + 20)::DECIMAL(10,2) as amount,
      CASE 
        WHEN random() < 0.7 THEN 'paid'
        WHEN random() < 0.9 THEN 'pending'
        ELSE 'failed'
      END as status,
      (now() - (random() * 30)::INTEGER * INTERVAL '1 day') as invoice_date,
      (now() - (random() * 15)::INTEGER * INTERVAL '1 day') as due_date,
      CASE 
        WHEN random() < 0.7 THEN (now() - (random() * 10)::INTEGER * INTERVAL '1 day')
        ELSE NULL
      END as payment_date
    FROM user_data u
  )
  SELECT 
    json_agg(
      json_build_object(
        'id', id,
        'organization_id', organization_id,
        'organization_name', organization_name,
        'amount', amount,
        'status', status,
        'invoice_date', invoice_date,
        'due_date', due_date,
        'payment_date', payment_date
      )
    ) INTO records
  FROM billing_data;
  
  -- Set total count to simulate pagination
  total_count := total_users;
  
  RETURN json_build_object(
    'records', COALESCE(records, '[]'::JSON),
    'total_count', total_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the get_system_settings function
CREATE OR REPLACE FUNCTION get_system_settings()
RETURNS JSON AS $$
BEGIN
  -- For demo purposes, we'll return hardcoded settings
  -- In a real application, you would query your actual settings table
  RETURN json_build_object(
    'system_name', 'Digital Signage Platform',
    'support_email', 'support@example.com',
    'timezone', 'Europe/London',
    'maintenance_mode', false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the update_system_settings function
CREATE OR REPLACE FUNCTION update_system_settings(settings JSON)
RETURNS JSON AS $$
BEGIN
  -- For demo purposes, we'll just return the input settings
  -- In a real application, you would update your actual settings table
  RETURN settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
