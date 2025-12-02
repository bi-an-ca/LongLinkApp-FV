/*
  # Allow Solo Use for Testing
  
  1. Changes
    - Update chat_messages INSERT policy to allow messages even without partner (for testing)
    - Update memories INSERT policy to allow memories without partner (for testing)
    - Keep validation that receiver/partner exists if provided
  
  2. Security
    - Users can only insert their own messages/memories
    - If partner_id/receiver_id is provided, validates it's their actual partner
    - Allows NULL partner for solo testing
  
  3. Notes
    - This is for development/testing purposes
    - In production, you may want stricter validation requiring partners
*/

-- Drop and recreate chat_messages INSERT policy to allow solo use
DROP POLICY IF EXISTS "Users can send messages to partner" ON chat_messages;

CREATE POLICY "Users can send messages to partner"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() 
    AND (
      -- Allow if no partner (solo testing)
      receiver_id IS NULL
      OR
      -- Or if receiver is the user's partner
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.partner_id = receiver_id
      )
    )
  );

-- Drop and recreate memories INSERT policy to allow solo use
DROP POLICY IF EXISTS "Users can create memories" ON memories;

CREATE POLICY "Users can create memories"
  ON memories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      -- Allow if no partner (solo testing)
      partner_id IS NULL
      OR
      -- Or if partner_id matches user's partner
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.partner_id = partner_id
      )
    )
  );
