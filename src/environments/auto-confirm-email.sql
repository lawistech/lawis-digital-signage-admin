-- Function to auto-confirm email for users created by super admins
CREATE OR REPLACE FUNCTION auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user was created by a super admin
  -- We can determine this by checking if the user has a role in their metadata
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    -- Auto-confirm the email
    UPDATE auth.users
    SET email_confirmed_at = NOW(),
        confirmed_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;

-- Create the trigger
CREATE TRIGGER auto_confirm_email_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE auto_confirm_email();
