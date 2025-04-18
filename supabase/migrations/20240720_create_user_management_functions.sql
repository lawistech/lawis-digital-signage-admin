-- Function to create a user with profile
-- This is a placeholder function that you can implement on your Supabase backend
CREATE OR REPLACE FUNCTION create_user_with_profile(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_role TEXT,
  p_organization_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user JSONB;
BEGIN
  -- Check if user is authorized to create users
  IF (auth.jwt() ->> 'role' != 'super_admin') THEN
    RAISE EXCEPTION 'Not authorized to create users';
  END IF;
  
  -- Create the user in auth.users
  -- Note: This requires proper configuration in Supabase to allow this function to create users
  -- You may need to use supabase_admin role or a custom hook
  -- For now, this is just a placeholder
  
  -- In a real implementation, you would use something like:
  -- SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  -- IF v_user_id IS NULL THEN
  --   INSERT INTO auth.users (email, password, ...) VALUES (...) RETURNING id INTO v_user_id;
  -- END IF;
  
  -- For demo purposes, we'll just return a mock user
  v_user := jsonb_build_object(
    'id', gen_random_uuid(),
    'email', p_email,
    'full_name', p_full_name,
    'role', p_role,
    'organization_id', p_organization_id,
    'created_at', now(),
    'last_sign_in_at', null
  );
  
  RETURN v_user;
END;
$$;

-- Function to delete a user with profile
-- This is a placeholder function that you can implement on your Supabase backend
CREATE OR REPLACE FUNCTION delete_user_with_profile(
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is authorized to delete users
  IF (auth.jwt() ->> 'role' != 'super_admin') THEN
    RAISE EXCEPTION 'Not authorized to delete users';
  END IF;
  
  -- Delete the user from auth.users
  -- Note: This requires proper configuration in Supabase to allow this function to delete users
  -- You may need to use supabase_admin role or a custom hook
  -- For now, this is just a placeholder
  
  -- In a real implementation, you would use something like:
  -- DELETE FROM auth.users WHERE id = p_user_id;
  
  -- For demo purposes, we'll just return success
  RETURN TRUE;
END;
$$;
