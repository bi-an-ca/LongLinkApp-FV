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

-- Insert some default daily prompts
INSERT INTO daily_prompts (prompt_text, date) VALUES
  ('What is one thing you appreciated about today?', CURRENT_DATE),
  ('What made you smile today?', CURRENT_DATE + INTERVAL '1 day'),
  ('What is something you are looking forward to?', CURRENT_DATE + INTERVAL '2 days'),
  ('Share a favorite memory of us together', CURRENT_DATE + INTERVAL '3 days'),
  ('What is one thing you love about our relationship?', CURRENT_DATE + INTERVAL '4 days'),
  ('If you could describe today in three words, what would they be?', CURRENT_DATE + INTERVAL '5 days'),
  ('What is something small that made your day better?', CURRENT_DATE + INTERVAL '6 days')
ON CONFLICT (date) DO NOTHING;