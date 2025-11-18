/*
  # Add Streak Tracking and Activity Features
  
  1. Add streak tracking to profiles
  2. Add last_seen_at for online status
  3. Add typing status tracking
*/

-- Add streak and activity fields to profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS mood_streak integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_mood_streak integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_mood_date date,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz DEFAULT now();

-- Add typing status table for real-time typing indicators
CREATE TABLE IF NOT EXISTS typing_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  is_typing boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, partner_id)
);

ALTER TABLE typing_status ENABLE ROW LEVEL SECURITY;

-- Users can view typing status with their partner
CREATE POLICY "Users can view typing status"
  ON typing_status FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    partner_id = (SELECT auth.uid())
  );

-- Users can update their own typing status
CREATE POLICY "Users can update own typing status"
  ON typing_status FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Users can insert their own typing status
CREATE POLICY "Users can insert own typing status"
  ON typing_status FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Function to update mood streak
CREATE OR REPLACE FUNCTION update_mood_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_date date;
  v_last_date date;
  v_current_streak integer;
  v_longest_streak integer;
BEGIN
  v_user_id := NEW.user_id;
  v_date := NEW.date;
  
  -- Get last mood date and current streak
  SELECT last_mood_date, mood_streak, longest_mood_streak
  INTO v_last_date, v_current_streak, v_longest_streak
  FROM profiles
  WHERE id = v_user_id;
  
  -- If no previous date or streak broken, reset to 1
  IF v_last_date IS NULL OR v_date != (v_last_date + INTERVAL '1 day') THEN
    v_current_streak := 1;
  ELSE
    -- Continue streak
    v_current_streak := COALESCE(v_current_streak, 0) + 1;
  END IF;
  
  -- Update longest streak if current is longer
  IF v_current_streak > COALESCE(v_longest_streak, 0) THEN
    v_longest_streak := v_current_streak;
  END IF;
  
  -- Update profile
  UPDATE profiles
  SET 
    mood_streak = v_current_streak,
    longest_mood_streak = v_longest_streak,
    last_mood_date = v_date
  WHERE id = v_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update streak on mood check-in
DROP TRIGGER IF EXISTS mood_streak_trigger ON mood_checkins;
CREATE TRIGGER mood_streak_trigger
  AFTER INSERT OR UPDATE ON mood_checkins
  FOR EACH ROW
  EXECUTE FUNCTION update_mood_streak();

-- Function to update last_seen_at
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET last_seen_at = now()
  WHERE id = (SELECT auth.uid());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_typing_status_user_partner ON typing_status(user_id, partner_id);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON profiles(last_seen_at);

