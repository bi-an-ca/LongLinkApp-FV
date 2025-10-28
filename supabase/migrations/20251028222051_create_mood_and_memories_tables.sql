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