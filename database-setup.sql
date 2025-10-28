-- LongLink Database Setup Script
-- Run this in your Supabase SQL Editor to set up the database

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  display_name text DEFAULT '',
  timezone text DEFAULT 'UTC',
  partner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view partner profile" ON profiles;
CREATE POLICY "Users can view partner profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = partner_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text DEFAULT '',
  image_url text DEFAULT '',
  reaction text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages with partner" ON chat_messages;
CREATE POLICY "Users can view messages with partner"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send messages to partner" ON chat_messages;
CREATE POLICY "Users can send messages to partner"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.partner_id = receiver_id
    )
  );

DROP POLICY IF EXISTS "Users can update own messages" ON chat_messages;
CREATE POLICY "Users can update own messages"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Create mood_checkins table
CREATE TABLE IF NOT EXISTS mood_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mood text NOT NULL,
  note text DEFAULT '',
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE mood_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own mood checkins" ON mood_checkins;
CREATE POLICY "Users can view own mood checkins"
  ON mood_checkins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view partner mood checkins" ON mood_checkins;
CREATE POLICY "Users can view partner mood checkins"
  ON mood_checkins FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.partner_id = user_id
    )
  );

DROP POLICY IF EXISTS "Users can insert own mood checkins" ON mood_checkins;
CREATE POLICY "Users can insert own mood checkins"
  ON mood_checkins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own mood checkins" ON mood_checkins;
CREATE POLICY "Users can update own mood checkins"
  ON mood_checkins FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  partner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL DEFAULT 'note',
  content text DEFAULT '',
  media_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own memories" ON memories;
CREATE POLICY "Users can view own memories"
  ON memories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = partner_id);

DROP POLICY IF EXISTS "Users can create memories" ON memories;
CREATE POLICY "Users can create memories"
  ON memories FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.partner_id = partner_id
    )
  );

DROP POLICY IF EXISTS "Users can update own memories" ON memories;
CREATE POLICY "Users can update own memories"
  ON memories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own memories" ON memories;
CREATE POLICY "Users can delete own memories"
  ON memories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create daily_prompts table
CREATE TABLE IF NOT EXISTS daily_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(date)
);

ALTER TABLE daily_prompts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view prompts" ON daily_prompts;
CREATE POLICY "Anyone can view prompts"
  ON daily_prompts FOR SELECT
  TO authenticated
  USING (true);

-- Create prompt_responses table
CREATE TABLE IF NOT EXISTS prompt_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES daily_prompts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  response text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(prompt_id, user_id)
);

ALTER TABLE prompt_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own responses" ON prompt_responses;
CREATE POLICY "Users can view own responses"
  ON prompt_responses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view partner responses" ON prompt_responses;
CREATE POLICY "Users can view partner responses"
  ON prompt_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.partner_id = user_id
    )
  );

DROP POLICY IF EXISTS "Users can create own responses" ON prompt_responses;
CREATE POLICY "Users can create own responses"
  ON prompt_responses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own responses" ON prompt_responses;
CREATE POLICY "Users can update own responses"
  ON prompt_responses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert default daily prompts
INSERT INTO daily_prompts (prompt_text, date) VALUES
  ('What is one thing you appreciated about today?', CURRENT_DATE),
  ('What made you smile today?', CURRENT_DATE + INTERVAL '1 day'),
  ('What is something you are looking forward to?', CURRENT_DATE + INTERVAL '2 days'),
  ('Share a favorite memory of us together', CURRENT_DATE + INTERVAL '3 days'),
  ('What is one thing you love about our relationship?', CURRENT_DATE + INTERVAL '4 days'),
  ('If you could describe today in three words, what would they be?', CURRENT_DATE + INTERVAL '5 days'),
  ('What is something small that made your day better?', CURRENT_DATE + INTERVAL '6 days')
ON CONFLICT (date) DO NOTHING;
