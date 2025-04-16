-- Function to get recent activity logs
CREATE OR REPLACE FUNCTION get_recent_activity_logs(limit_count INTEGER DEFAULT 10)
RETURNS SETOF activity_logs
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is a super admin
  IF (auth.jwt() ->> 'role' != 'super_admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  RETURN QUERY
  SELECT *
  FROM activity_logs
  ORDER BY created_at DESC
  LIMIT limit_count;
END;
$$;

-- Function to get all activity logs with pagination
CREATE OR REPLACE FUNCTION get_all_activity_logs(page_number INTEGER DEFAULT 1, page_size INTEGER DEFAULT 10)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  logs JSON;
  total_count INTEGER;
  offset_val INTEGER;
BEGIN
  -- Check if user is a super admin
  IF (auth.jwt() ->> 'role' != 'super_admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  -- Calculate offset
  offset_val := (page_number - 1) * page_size;
  
  -- Get total count
  SELECT COUNT(*) INTO total_count FROM activity_logs;
  
  -- Get logs with pagination
  SELECT json_agg(t)
  INTO logs
  FROM (
    SELECT *
    FROM activity_logs
    ORDER BY created_at DESC
    LIMIT page_size
    OFFSET offset_val
  ) t;
  
  -- Return logs and total count
  RETURN json_build_object(
    'logs', COALESCE(logs, '[]'::json),
    'total_count', total_count
  );
END;
$$;

-- Function to create an activity log
CREATE OR REPLACE FUNCTION create_activity_log(
  user_id UUID,
  user_email TEXT,
  action TEXT,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB DEFAULT NULL
)
RETURNS activity_logs
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_log activity_logs;
BEGIN
  -- Insert new log
  INSERT INTO activity_logs (
    user_id,
    user_email,
    action,
    entity_type,
    entity_id,
    details,
    created_at
  )
  VALUES (
    user_id,
    user_email,
    action,
    entity_type,
    entity_id,
    details,
    NOW()
  )
  RETURNING * INTO new_log;
  
  RETURN new_log;
END;
$$;
