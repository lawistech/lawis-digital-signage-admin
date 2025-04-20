-- Create the subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_plans (
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
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_subscription_plans'
  ) THEN
    CREATE TRIGGER set_timestamp_subscription_plans
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
  END IF;
END $$;

-- Insert default plans if the table is empty
INSERT INTO subscription_plans (name, price, max_screens, max_users, description, features, is_popular)
SELECT 'Basic', 9.99, 1, 2, 'Basic features for small deployments', '["Basic content scheduling", "Standard support"]', false
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Basic');

INSERT INTO subscription_plans (name, price, max_screens, max_users, description, features, is_popular)
SELECT 'Standard', 29.99, 5, 10, 'Advanced features for growing businesses', '["Advanced scheduling", "Priority support", "Content templates"]', true
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Standard');

INSERT INTO subscription_plans (name, price, max_screens, max_users, description, features, is_popular)
SELECT 'Premium', 99.99, 20, 50, 'Full features for large-scale deployments', '["Custom branding", "API access", "Advanced analytics", "Dedicated support"]', false
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Premium');

-- Create function to get all subscription plans
CREATE OR REPLACE FUNCTION get_subscription_plans()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', id,
      'name', name,
      'price', price,
      'max_screens', max_screens,
      'max_users', max_users,
      'description', COALESCE(description, ''),
      'features', COALESCE(features, '[]'::jsonb),
      'is_popular', COALESCE(is_popular, false),
      'is_active', COALESCE(is_active, true),
      'created_at', created_at,
      'updated_at', updated_at
    )
  )
  INTO result
  FROM subscription_plans
  ORDER BY price ASC;

  -- Return empty array if no plans found
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Create function to update a subscription plan
CREATE OR REPLACE FUNCTION update_subscription_plan(plan_id UUID, plan_data json)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  features_value jsonb;
BEGIN
  -- Remove the role check to allow any authenticated user to update plans
  -- In a production environment, you would want to add proper authorization checks

  -- Handle the features field properly
  IF plan_data->'features' IS NOT NULL THEN
    features_value := plan_data->'features';
  ELSE
    -- Keep existing features if not provided
    SELECT features INTO features_value FROM subscription_plans WHERE id = plan_id;
  END IF;

  UPDATE subscription_plans
  SET
    name = COALESCE(plan_data->>'name', name),
    price = COALESCE((plan_data->>'price')::DECIMAL, price),
    max_screens = COALESCE((plan_data->>'max_screens')::INTEGER, max_screens),
    max_users = COALESCE((plan_data->>'max_users')::INTEGER, max_users),
    description = COALESCE(plan_data->>'description', description),
    features = features_value,
    is_popular = COALESCE((plan_data->>'is_popular')::BOOLEAN, is_popular),
    is_active = COALESCE((plan_data->>'is_active')::BOOLEAN, is_active),
    updated_at = NOW()
  WHERE id = plan_id;

  RETURN (
    SELECT json_build_object(
      'id', id,
      'name', name,
      'price', price,
      'max_screens', max_screens,
      'max_users', max_users,
      'description', description,
      'features', features,
      'is_popular', is_popular,
      'is_active', is_active,
      'created_at', created_at,
      'updated_at', updated_at
    )
    FROM subscription_plans
    WHERE id = plan_id
  );
END;
$$;

-- Create function to add a new subscription plan
CREATE OR REPLACE FUNCTION add_subscription_plan(plan_data json)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_plan_id UUID;
  features_value jsonb;
BEGIN
  -- Remove the role check to allow any authenticated user to add plans
  -- In a production environment, you would want to add proper authorization checks

  -- Handle the features field properly
  IF plan_data->'features' IS NOT NULL THEN
    features_value := plan_data->'features';
  ELSE
    features_value := '[]'::jsonb;
  END IF;

  INSERT INTO subscription_plans (
    name,
    price,
    max_screens,
    max_users,
    description,
    features,
    is_popular,
    is_active
  ) VALUES (
    plan_data->>'name',
    (plan_data->>'price')::DECIMAL,
    (plan_data->>'max_screens')::INTEGER,
    (plan_data->>'max_users')::INTEGER,
    plan_data->>'description',
    features_value,
    COALESCE((plan_data->>'is_popular')::BOOLEAN, false),
    COALESCE((plan_data->>'is_active')::BOOLEAN, true)
  )
  RETURNING id INTO new_plan_id;

  RETURN (
    SELECT json_build_object(
      'id', id,
      'name', name,
      'price', price,
      'max_screens', max_screens,
      'max_users', max_users,
      'description', description,
      'features', features,
      'is_popular', is_popular,
      'is_active', is_active,
      'created_at', created_at,
      'updated_at', updated_at
    )
    FROM subscription_plans
    WHERE id = new_plan_id
  );
END;
$$;

-- Create function to delete a subscription plan
CREATE OR REPLACE FUNCTION delete_subscription_plan(plan_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove the role check to allow any authenticated user to delete plans
  -- In a production environment, you would want to add proper authorization checks

  -- Check if the plan is in use by any organizations
  IF EXISTS (
    SELECT 1
    FROM organizations
    WHERE subscription_tier = (
      SELECT name
      FROM subscription_plans
      WHERE id = plan_id
    )
  ) THEN
    RAISE EXCEPTION 'Cannot delete plan that is in use by organizations';
  END IF;

  DELETE FROM subscription_plans
  WHERE id = plan_id;

  RETURN true;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_subscription_plans() TO authenticated;
GRANT EXECUTE ON FUNCTION update_subscription_plan(UUID, json) TO authenticated;
GRANT EXECUTE ON FUNCTION add_subscription_plan(json) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_subscription_plan(UUID) TO authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON subscription_plans TO authenticated;
