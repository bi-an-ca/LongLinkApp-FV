/*
  # Add Invite Code System
  
  1. Changes
    - Add invite_code column to profiles table
    - Add unique constraint on invite_code
    - Create function to generate unique invite codes
    - Create trigger to auto-generate invite codes on profile creation
  
  2. Security
    - Invite codes are unique and auto-generated
    - Users can view their own invite code
    - Users can search for profiles by invite code to link partners
*/

-- Add invite_code column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'invite_code'
  ) THEN
    ALTER TABLE profiles ADD COLUMN invite_code text UNIQUE;
  END IF;
END $$;

-- Function to generate a random 6-character invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to ensure unique invite code
CREATE OR REPLACE FUNCTION ensure_unique_invite_code()
RETURNS text AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    new_code := generate_invite_code();
    SELECT EXISTS(SELECT 1 FROM profiles WHERE invite_code = new_code) INTO code_exists;
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to auto-generate invite code
CREATE OR REPLACE FUNCTION set_invite_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := ensure_unique_invite_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS set_invite_code_trigger ON profiles;
CREATE TRIGGER set_invite_code_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_invite_code();

-- Update existing profiles without invite codes
UPDATE profiles
SET invite_code = ensure_unique_invite_code()
WHERE invite_code IS NULL;

-- Add policy for users to search by invite code
DROP POLICY IF EXISTS "Users can search profiles by invite code" ON profiles;
CREATE POLICY "Users can search profiles by invite code"
  ON profiles FOR SELECT
  TO authenticated
  USING (invite_code IS NOT NULL);