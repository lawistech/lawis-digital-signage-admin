-- Create the system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  system_name TEXT NOT NULL DEFAULT 'Digital Signage Platform',
  support_email TEXT NOT NULL DEFAULT 'support@example.com',
  timezone TEXT NOT NULL DEFAULT 'Europe/London',
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraint to ensure only one row if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'single_row_constraint'
  ) THEN
    ALTER TABLE system_settings ADD CONSTRAINT single_row_constraint CHECK (id = 1);
  END IF;
END $$;

-- Insert default row if it doesn't exist
INSERT INTO system_settings (id)
SELECT 1
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE id = 1);

-- Create or replace the get_system_settings function
CREATE OR REPLACE FUNCTION get_system_settings()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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

-- Create or replace the update_system_settings function
CREATE OR REPLACE FUNCTION update_system_settings(settings json)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
