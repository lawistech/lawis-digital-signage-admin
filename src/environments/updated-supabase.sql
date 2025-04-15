-- Updated RPC functions for super admin dashboard

-- Update the screen stats function to include user count
CREATE OR REPLACE FUNCTION get_screen_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (auth.jwt() ->> 'role' != 'super_admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  RETURN (
    SELECT json_build_object(
      'total', (SELECT COUNT(*) FROM screens),
      'active', (SELECT COUNT(*) FROM screens WHERE status = 'active'),
      'totalUsers', (SELECT COUNT(*) FROM profiles)
    )
  );
END;
$$;

-- Update the revenue stats function to handle missing amount column
CREATE OR REPLACE FUNCTION get_revenue_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (auth.jwt() ->> 'role' != 'super_admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  -- Check if the amount column exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'organization_subscriptions' 
    AND column_name = 'amount'
  ) THEN
    RETURN (
      SELECT json_build_object(
        'monthly', COALESCE(SUM(amount), 0)
      )
      FROM organization_subscriptions
      WHERE created_at >= date_trunc('month', CURRENT_DATE)
    );
  ELSE
    -- If amount column doesn't exist, return a default value
    RETURN json_build_object('monthly', 0);
  END IF;
END;
$$;

-- Create a function to get all system settings
CREATE OR REPLACE FUNCTION get_system_settings()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (auth.jwt() ->> 'role' != 'super_admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  -- Check if the system_settings table exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'system_settings'
  ) THEN
    RETURN (
      SELECT row_to_json(s)
      FROM system_settings s
      LIMIT 1
    );
  ELSE
    -- Return default settings if table doesn't exist
    RETURN json_build_object(
      'system_name', 'Digital Signage Platform',
      'support_email', 'support@example.com',
      'timezone', 'Europe/London',
      'maintenance_mode', false
    );
  END IF;
END;
$$;

-- Create a function to update system settings
CREATE OR REPLACE FUNCTION update_system_settings(settings json)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (auth.jwt() ->> 'role' != 'super_admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  -- Check if the system_settings table exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'system_settings'
  ) THEN
    -- Create the table if it doesn't exist
    CREATE TABLE system_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      system_name TEXT NOT NULL DEFAULT 'Digital Signage Platform',
      support_email TEXT NOT NULL DEFAULT 'support@example.com',
      timezone TEXT NOT NULL DEFAULT 'Europe/London',
      maintenance_mode BOOLEAN NOT NULL DEFAULT false,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Add constraint to ensure only one row
    ALTER TABLE system_settings ADD CONSTRAINT single_row_constraint CHECK (id = 1);
    
    -- Insert default row
    INSERT INTO system_settings (id) VALUES (1);
  END IF;
  
  -- Update the settings
  UPDATE system_settings
  SET 
    system_name = COALESCE(settings->>'system_name', system_name),
    support_email = COALESCE(settings->>'support_email', support_email),
    timezone = COALESCE(settings->>'timezone', timezone),
    maintenance_mode = COALESCE((settings->>'maintenance_mode')::boolean, maintenance_mode),
    updated_at = NOW()
  WHERE id = 1;
  
  -- Return the updated settings
  RETURN (
    SELECT row_to_json(s)
    FROM system_settings s
    WHERE id = 1
  );
END;
$$;

-- Create a function to get billing summary
CREATE OR REPLACE FUNCTION get_billing_summary()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (auth.jwt() ->> 'role' != 'super_admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  -- Check if the organization_subscriptions table has the amount column
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'organization_subscriptions' 
    AND column_name = 'amount'
  ) THEN
    RETURN (
      SELECT json_build_object(
        'totalRevenue', COALESCE(SUM(amount), 0),
        'outstandingAmount', COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0),
        'activeSubscriptions', COUNT(*) FILTER (WHERE status = 'active')
      )
      FROM organization_subscriptions
    );
  ELSE
    -- Return default values if amount column doesn't exist
    RETURN json_build_object(
      'totalRevenue', 0,
      'outstandingAmount', 0,
      'activeSubscriptions', (SELECT COUNT(*) FROM organizations WHERE subscription_status = 'active')
    );
  END IF;
END;
$$;

-- Create a function to get all billing records
CREATE OR REPLACE FUNCTION get_billing_records(page_number integer, page_size integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_offset integer;
  records json;
  total_count integer;
BEGIN
  IF (auth.jwt() ->> 'role' != 'super_admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  -- Calculate the offset
  start_offset := (page_number - 1) * page_size;
  
  -- Check if the organization_subscriptions table has the amount column
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'organization_subscriptions' 
    AND column_name = 'amount'
  ) THEN
    -- Get the total count
    SELECT COUNT(*) INTO total_count FROM organization_subscriptions;
    
    -- Get the records
    SELECT json_agg(
      json_build_object(
        'id', s.id,
        'organization_id', s.organization_id,
        'organization_name', o.name,
        'amount', s.amount,
        'status', s.status,
        'invoice_date', s.created_at,
        'due_date', s.current_period_end,
        'payment_date', CASE WHEN s.status = 'paid' THEN s.updated_at ELSE NULL END
      )
    )
    INTO records
    FROM organization_subscriptions s
    JOIN organizations o ON s.organization_id = o.id
    ORDER BY s.created_at DESC
    LIMIT page_size
    OFFSET start_offset;
    
    -- Return the records and total count
    RETURN json_build_object(
      'records', COALESCE(records, '[]'::json),
      'total_count', total_count
    );
  ELSE
    -- Return empty records if amount column doesn't exist
    RETURN json_build_object(
      'records', '[]'::json,
      'total_count', 0
    );
  END IF;
END;
$$;
