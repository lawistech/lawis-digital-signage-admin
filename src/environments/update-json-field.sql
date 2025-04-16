-- Function to update a specific field in a JSON column
CREATE OR REPLACE FUNCTION update_json_field(
  p_table text,
  p_field text,
  p_key text,
  p_value jsonb
) RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  -- This function creates a SQL statement that will update a specific key in a JSON/JSONB field
  -- without overwriting the entire JSON object
  EXECUTE format('
    SELECT CASE 
      WHEN %I IS NULL THEN jsonb_build_object(%L, %L)
      WHEN jsonb_typeof(%I) <> ''object'' THEN jsonb_build_object(%L, %L)
      ELSE %I || jsonb_build_object(%L, %L)
    END',
    p_field, p_key, p_value,
    p_field, p_key, p_value,
    p_field, p_key, p_value
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
