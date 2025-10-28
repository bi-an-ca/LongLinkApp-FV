/*
  # Create Calendar Events Table
  
  1. New Tables
    - `calendar_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles) - Creator of the event
      - `title` (text) - Event title
      - `description` (text) - Event description
      - `event_date` (date) - Date of the event
      - `event_time` (time) - Time of the event (optional)
      - `event_type` (text) - Type: 'reunion', 'reminder', 'anniversary', 'other'
      - `location` (text) - Event location
      - `is_shared` (boolean) - Whether event is visible to partner
      - `reminder_enabled` (boolean) - Whether to send reminders
      - `reminder_days_before` (integer) - Days before event to remind
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `calendar_events` table
    - Users can view their own events
    - Users can view partner's shared events
    - Users can create their own events
    - Users can update their own events
    - Users can delete their own events
*/

CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  event_date date NOT NULL,
  event_time time,
  event_type text DEFAULT 'other' CHECK (event_type IN ('reunion', 'reminder', 'anniversary', 'birthday', 'other')),
  location text DEFAULT '',
  is_shared boolean DEFAULT true,
  reminder_enabled boolean DEFAULT true,
  reminder_days_before integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own events" ON calendar_events;
CREATE POLICY "Users can view own events"
  ON calendar_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view partner shared events" ON calendar_events;
CREATE POLICY "Users can view partner shared events"
  ON calendar_events FOR SELECT
  TO authenticated
  USING (
    is_shared = true AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.partner_id = user_id
    )
  );

DROP POLICY IF EXISTS "Users can create own events" ON calendar_events;
CREATE POLICY "Users can create own events"
  ON calendar_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own events" ON calendar_events;
CREATE POLICY "Users can update own events"
  ON calendar_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own events" ON calendar_events;
CREATE POLICY "Users can delete own events"
  ON calendar_events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_event_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(event_type);