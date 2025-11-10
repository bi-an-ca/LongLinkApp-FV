/*
  # Make memories.partner_id nullable
  
  1. Allow personal memories
    - Change partner_id from NOT NULL to nullable
    - Users can now create personal memories without a partner
    - Update RLS policies to allow creating memories without partner verification
  
  2. Updated Policies
    - Allow users to create memories with or without a partner
    - Users can view their own memories (with or without partner)
*/

-- Make partner_id nullable
ALTER TABLE memories 
  ALTER COLUMN partner_id DROP NOT NULL;

-- Drop the old insert policy that requires partner verification
DROP POLICY IF EXISTS "Users can create memories" ON memories;

-- Create new insert policy that allows creating memories with or without partner
CREATE POLICY "Users can create memories"
  ON memories FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id AND
    (
      partner_id IS NULL OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = (SELECT auth.uid())
        AND profiles.partner_id = memories.partner_id
      )
    )
  );

-- Update the select policy to allow viewing personal memories (where partner_id is NULL)
-- Users can view their own memories (with or without partner) or memories where they are the partner
DROP POLICY IF EXISTS "Users can view own memories" ON memories;
CREATE POLICY "Users can view own memories"
  ON memories FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id OR 
    (SELECT auth.uid()) = partner_id
  );

