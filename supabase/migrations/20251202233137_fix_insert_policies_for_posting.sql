/*
  # Fix INSERT Policies for Chat and Memories
  
  1. Changes
    - Update chat_messages INSERT policy to allow sending messages to partner
    - Update memories INSERT policy to allow creating memories with partner
    - Both policies now properly validate partner relationship without blocking valid inserts
  
  2. Security
    - Users can only send messages to their linked partner
    - Users can only create memories with their linked partner
    - Validates that receiver/partner exists and is actually the user's partner
*/

-- Drop and recreate chat_messages INSERT policy
DROP POLICY IF EXISTS "Users can send messages to partner" ON chat_messages;

CREATE POLICY "Users can send messages to partner"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.partner_id = chat_messages.receiver_id
    )
  );

-- Drop and recreate memories INSERT policy
DROP POLICY IF EXISTS "Users can create memories" ON memories;

CREATE POLICY "Users can create memories"
  ON memories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.partner_id = memories.partner_id
    )
  );
