-- Function to get screen count for a specific user
CREATE OR REPLACE FUNCTION get_user_screen_count(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  screen_count INTEGER;
BEGIN
  -- Count screens associated with areas owned by this user
  SELECT COUNT(s.id) INTO screen_count
  FROM screens s
  JOIN areas a ON s.area_id = a.id
  WHERE a.user_id = user_id;
  
  RETURN COALESCE(screen_count, 0);
END;
$$;

-- Function to get screen counts for all users
CREATE OR REPLACE FUNCTION get_all_user_screen_counts()
RETURNS TABLE(user_id UUID, screen_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS user_id,
    COALESCE(COUNT(s.id), 0)::INTEGER AS screen_count
  FROM 
    profiles p
  LEFT JOIN 
    areas a ON p.id = a.user_id
  LEFT JOIN 
    screens s ON a.id = s.area_id
  GROUP BY 
    p.id;
END;
$$;

-- Update the screen stats function to use actual screen counts
CREATE OR REPLACE FUNCTION get_screen_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_screens INTEGER;
  active_screens INTEGER;
  total_users INTEGER;
BEGIN
  -- Count total users
  SELECT COUNT(*) INTO total_users FROM profiles;
  
  -- Count actual screens
  SELECT COUNT(*) INTO total_screens FROM screens;
  
  -- Count active screens
  SELECT COUNT(*) INTO active_screens FROM screens WHERE status = 'online' OR status = 'active';
  
  RETURN json_build_object(
    'total', total_screens,
    'active', active_screens,
    'totalUsers', total_users
  );
END;
$$;
