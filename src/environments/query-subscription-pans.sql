-- Check if the subscription_pans table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'subscription_pans'
);

-- If it exists, create a function to get subscription plans from subscription_pans table
CREATE OR REPLACE FUNCTION get_subscription_plans_from_pans()
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
  FROM subscription_pans
  ORDER BY price ASC;

  -- Return empty array if no plans found
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Create function to update a subscription plan in subscription_pans table
CREATE OR REPLACE FUNCTION update_subscription_plan_in_pans(plan_id UUID, plan_data json)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  features_value jsonb;
  result json;
BEGIN
  -- Handle the features field properly
  IF plan_data->'features' IS NOT NULL THEN
    features_value := plan_data->'features';
  ELSE
    -- Keep existing features if not provided
    SELECT features INTO features_value FROM subscription_pans WHERE id = plan_id;
  END IF;

  UPDATE subscription_pans
  SET 
    name = COALESCE((plan_data->>'name')::TEXT, name),
    price = COALESCE((plan_data->>'price')::DECIMAL, price),
    max_screens = COALESCE((plan_data->>'max_screens')::INTEGER, max_screens),
    max_users = COALESCE((plan_data->>'max_users')::INTEGER, max_users),
    description = COALESCE((plan_data->>'description')::TEXT, description),
    features = features_value,
    is_popular = COALESCE((plan_data->>'is_popular')::BOOLEAN, is_popular),
    is_active = COALESCE((plan_data->>'is_active')::BOOLEAN, is_active),
    updated_at = NOW()
  WHERE id = plan_id;
  
  SELECT json_build_object(
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
  INTO result
  FROM subscription_pans
  WHERE id = plan_id;
  
  RETURN result;
END;
$$;

-- Create function to add a new subscription plan to subscription_pans table
CREATE OR REPLACE FUNCTION add_subscription_plan_to_pans(plan_data json)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_plan_id UUID;
  features_value jsonb;
  result json;
BEGIN
  -- Handle the features field properly
  IF plan_data->'features' IS NOT NULL THEN
    features_value := plan_data->'features';
  ELSE
    features_value := '[]'::jsonb;
  END IF;

  INSERT INTO subscription_pans (
    name,
    price,
    max_screens,
    max_users,
    description,
    features,
    is_popular,
    is_active
  ) VALUES (
    (plan_data->>'name')::TEXT,
    (plan_data->>'price')::DECIMAL,
    (plan_data->>'max_screens')::INTEGER,
    (plan_data->>'max_users')::INTEGER,
    (plan_data->>'description')::TEXT,
    features_value,
    COALESCE((plan_data->>'is_popular')::BOOLEAN, false),
    COALESCE((plan_data->>'is_active')::BOOLEAN, true)
  )
  RETURNING id INTO new_plan_id;
  
  SELECT json_build_object(
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
  INTO result
  FROM subscription_pans
  WHERE id = new_plan_id;
  
  RETURN result;
END;
$$;

-- Create function to delete a subscription plan from subscription_pans table
CREATE OR REPLACE FUNCTION delete_subscription_plan_from_pans(plan_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the plan is in use by any organizations
  IF EXISTS (
    SELECT 1
    FROM organizations
    WHERE subscription_tier = (
      SELECT name
      FROM subscription_pans
      WHERE id = plan_id
    )
  ) THEN
    RAISE EXCEPTION 'Cannot delete plan that is in use by organizations';
  END IF;

  DELETE FROM subscription_pans
  WHERE id = plan_id;

  RETURN true;
END;
$$;
