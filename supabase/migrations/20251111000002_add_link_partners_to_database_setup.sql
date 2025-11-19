/*
  # Add link_partners function to database-setup.sql compatibility
  
  This migration ensures the link_partners function exists for databases
  that were set up using database-setup.sql (which didn't originally include it).
  
  This is idempotent - safe to run multiple times.
*/

-- Create atomic partner linking function (idempotent)
CREATE OR REPLACE FUNCTION link_partners(user1_id uuid, user2_id uuid)
RETURNS void AS $$
DECLARE
  user1_partner_id uuid;
  user2_partner_id uuid;
BEGIN
  -- Get current partner status for both users
  SELECT partner_id INTO user1_partner_id FROM profiles WHERE id = user1_id;
  SELECT partner_id INTO user2_partner_id FROM profiles WHERE id = user2_id;
  
  -- Check if user1 already has a partner
  IF user1_partner_id IS NOT NULL THEN
    RAISE EXCEPTION 'User 1 already has a partner';
  END IF;
  
  -- Check if user2 already has a partner
  IF user2_partner_id IS NOT NULL THEN
    RAISE EXCEPTION 'User 2 already has a partner';
  END IF;
  
  -- Check if trying to link with self
  IF user1_id = user2_id THEN
    RAISE EXCEPTION 'Cannot link with yourself';
  END IF;
  
  -- Update both users atomically
  UPDATE profiles SET partner_id = user2_id WHERE id = user1_id;
  UPDATE profiles SET partner_id = user1_id WHERE id = user2_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (idempotent)
GRANT EXECUTE ON FUNCTION link_partners(uuid, uuid) TO authenticated;

-- Add comment
COMMENT ON FUNCTION link_partners IS 'Atomically links two user profiles as partners, preventing race conditions';

