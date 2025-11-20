/*
  # Enable Realtime for All Existing Application Tables
  
  1. Changes
    - Enable realtime replication for all existing tables used in the app
    - Ensures real-time updates work across all features
  
  2. Tables Enabled
    - chat_messages: Real-time chat updates
    - memories: Shared memories feed updates
    - mood_checkins: Mood check-in updates
    - prompt_responses: Daily prompt responses
    - calendar_events: Calendar event updates
    - daily_prompts: Daily prompts updates
  
  3. Security
    - Realtime respects existing RLS policies
    - Users only receive updates for data they have permission to read
*/

-- Enable realtime for all existing application tables
-- Using DO block to handle tables that might already be in publication
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE memories;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE mood_checkins;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE prompt_responses;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE calendar_events;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE daily_prompts;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- Set replica identity to full for all tables to get complete row data in realtime events
ALTER TABLE chat_messages REPLICA IDENTITY FULL;
ALTER TABLE memories REPLICA IDENTITY FULL;
ALTER TABLE mood_checkins REPLICA IDENTITY FULL;
ALTER TABLE prompt_responses REPLICA IDENTITY FULL;
ALTER TABLE calendar_events REPLICA IDENTITY FULL;
ALTER TABLE daily_prompts REPLICA IDENTITY FULL;
