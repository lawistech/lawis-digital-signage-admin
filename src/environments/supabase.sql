-- NOTE: Run these SQL commands in your Supabase SQL Editor

-- Drop existing tables if needed (uncomment if you want to start fresh)
-- DROP TABLE IF EXISTS organization_subscriptions CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;
-- DROP TABLE IF EXISTS organizations CASCADE;

-- Customer organizations table (create this first)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'basic',
  subscription_status TEXT NOT NULL DEFAULT 'active',
  max_screens INTEGER NOT NULL DEFAULT 1,
  max_users INTEGER NOT NULL DEFAULT 1,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add organization_id column to profiles if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN organization_id UUID;
  END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_organization'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT fk_organization 
    FOREIGN KEY (organization_id) 
    REFERENCES organizations(id);
  END IF;
END $$;

-- Organization billing/subscription table
CREATE TABLE IF NOT EXISTS organization_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Super admin can manage organizations" ON organizations;
DROP POLICY IF EXISTS "Super admin can manage subscriptions" ON organization_subscriptions;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Super admin can manage everything
CREATE POLICY "Super admin can manage organizations" 
  ON organizations FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Super admin can manage subscriptions" 
  ON organization_subscriptions FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- Profiles policies
CREATE POLICY "Users can view all profiles" 
  ON profiles FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  TO authenticated 
  USING (id = auth.uid());

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_timestamp_profiles ON profiles;

-- Add trigger for profiles
CREATE TRIGGER set_timestamp_profiles
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Function to handle new user registrations
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger after user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Stats functions for super admin
CREATE OR REPLACE FUNCTION get_organization_stats()
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
      'total', COUNT(*),
      'active', COUNT(*) FILTER (WHERE subscription_status = 'active'),
      'totalUsers', SUM(max_users)
    )
    FROM organizations
  );
END;
$$;

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
      'total', COUNT(*),
      'active', COUNT(*) FILTER (WHERE status = 'active')
    )
    FROM screens
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_revenue_stats()
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
      'monthly', COALESCE(SUM(amount), 0)
    )
    FROM organization_subscriptions
    WHERE created_at >= date_trunc('month', CURRENT_DATE)
  );
END;
$$;
