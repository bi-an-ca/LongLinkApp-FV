/*
  # Fix Function Search Paths
  
  1. Security Improvement
    - Set immutable search_path for all functions to prevent SQL injection
    - Use SECURITY DEFINER with explicit search_path for safety
  
  2. Updated Functions
    - generate_invite_code() - Fixed search path
    - ensure_unique_invite_code() - Fixed search path
    - set_invite_code() - Fixed search path
*/

-- Recreate generate_invite_code with fixed search path
DROP FUNCTION IF EXISTS generate_invite_code();
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Recreate ensure_unique_invite_code with fixed search path
DROP FUNCTION IF EXISTS ensure_unique_invite_code();
CREATE OR REPLACE FUNCTION ensure_unique_invite_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    new_code := generate_invite_code();
    SELECT EXISTS(SELECT 1 FROM profiles WHERE invite_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Recreate set_invite_code trigger function with fixed search path
DROP FUNCTION IF EXISTS set_invite_code() CASCADE;
CREATE OR REPLACE FUNCTION set_invite_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := ensure_unique_invite_code();
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS set_invite_code_trigger ON profiles;
CREATE TRIGGER set_invite_code_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_invite_code();