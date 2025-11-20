/*
  # Enable Realtime for Profiles Table
  
  1. Changes
    - Enable realtime replication for the profiles table
    - This allows real-time subscriptions to work properly
    - Critical for partner linking to sync across both users instantly
  
  2. Security
    - Realtime respects existing RLS policies
    - Users can only receive updates for data they have permission to read
*/

-- Enable realtime for the profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Ensure replica identity is set to full so we get all column values in realtime events
ALTER TABLE profiles REPLICA IDENTITY FULL;
