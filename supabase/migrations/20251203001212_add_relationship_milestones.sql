/*
  # Add Relationship Milestones Table
  
  1. New Tables
    - `relationship_milestones`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `partner_id` (uuid, foreign key to profiles)
      - `milestone_type` (text) - 'anniversary', 'first_message', 'first_memory', 'custom'
      - `title` (text)
      - `description` (text, nullable)
      - `milestone_date` (date)
      - `created_at` (timestamptz)
      - Unique constraint on (user_id, partner_id, milestone_type, milestone_date)
  
  2. Security
    - Enable RLS on relationship_milestones table
    - Users can view milestones with their partner
    - Users can insert milestones
    - Users can update their own milestones
    - Users can delete their own milestones
  
  3. Functions
    - create_first_message_milestone() - Auto-creates milestone when first message is sent
  
  4. Indexes
    - Index on (user_id, partner_id) for fast lookups
    - Index on milestone_date for date queries
*/

CREATE TABLE IF NOT EXISTS relationship_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  milestone_type text NOT NULL,
  title text NOT NULL,
  description text,
  milestone_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, partner_id, milestone_type, milestone_date)
);

ALTER TABLE relationship_milestones ENABLE ROW LEVEL SECURITY;

-- Users can view milestones with their partner
CREATE POLICY "Users can view relationship milestones"
  ON relationship_milestones FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    partner_id = auth.uid()
  );

-- Users can insert milestones
CREATE POLICY "Users can insert relationship milestones"
  ON relationship_milestones FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    partner_id = auth.uid()
  );

-- Users can update their own milestones
CREATE POLICY "Users can update own milestones"
  ON relationship_milestones FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own milestones
CREATE POLICY "Users can delete own milestones"
  ON relationship_milestones FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Function to auto-create first message milestone
CREATE OR REPLACE FUNCTION create_first_message_milestone()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_partner_id uuid;
BEGIN
  -- Only create milestone for the first message between two users
  IF NOT EXISTS (
    SELECT 1 FROM chat_messages
    WHERE (sender_id = NEW.sender_id AND receiver_id = NEW.receiver_id)
       OR (sender_id = NEW.receiver_id AND receiver_id = NEW.sender_id)
    AND id != NEW.id
  ) THEN
    -- Create milestone for sender
    INSERT INTO relationship_milestones (user_id, partner_id, milestone_type, title, description, milestone_date)
    VALUES (
      NEW.sender_id,
      NEW.receiver_id,
      'first_message',
      'First Message',
      'The beginning of your conversation',
      CURRENT_DATE
    )
    ON CONFLICT DO NOTHING;
    
    -- Create milestone for receiver
    INSERT INTO relationship_milestones (user_id, partner_id, milestone_type, title, description, milestone_date)
    VALUES (
      NEW.receiver_id,
      NEW.sender_id,
      'first_message',
      'First Message',
      'The beginning of your conversation',
      CURRENT_DATE
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create first message milestone
DROP TRIGGER IF EXISTS first_message_milestone_trigger ON chat_messages;
CREATE TRIGGER first_message_milestone_trigger
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION create_first_message_milestone();

CREATE INDEX IF NOT EXISTS idx_milestones_user_partner ON relationship_milestones(user_id, partner_id);
CREATE INDEX IF NOT EXISTS idx_milestones_date ON relationship_milestones(milestone_date);
