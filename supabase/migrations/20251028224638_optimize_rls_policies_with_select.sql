/*
  # Optimize RLS Policies with SELECT Wrapper
  
  1. Performance Improvement
    - Wrap all auth.uid() calls with (SELECT auth.uid()) to prevent re-evaluation
    - This significantly improves query performance at scale
    - See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
  
  2. Updated Policies
    - All RLS policies across all tables updated for optimal performance
    - Functionality remains exactly the same, only performance improves
*/

-- Profiles table policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can view partner profile" ON profiles;
CREATE POLICY "Users can view partner profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = (SELECT auth.uid())
      AND p.partner_id = profiles.id
    )
  );

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can search profiles by invite code" ON profiles;
CREATE POLICY "Users can search profiles by invite code"
  ON profiles FOR SELECT
  TO authenticated
  USING (invite_code IS NOT NULL);

-- Chat messages policies
DROP POLICY IF EXISTS "Users can view messages with partner" ON chat_messages;
CREATE POLICY "Users can view messages with partner"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    sender_id = (SELECT auth.uid()) OR receiver_id = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS "Users can send messages to partner" ON chat_messages;
CREATE POLICY "Users can send messages to partner"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid()) AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.partner_id = chat_messages.receiver_id
    )
  );

DROP POLICY IF EXISTS "Users can update own messages" ON chat_messages;
CREATE POLICY "Users can update own messages"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (sender_id = (SELECT auth.uid()))
  WITH CHECK (sender_id = (SELECT auth.uid()));

-- Mood checkins policies
DROP POLICY IF EXISTS "Users can view own mood checkins" ON mood_checkins;
CREATE POLICY "Users can view own mood checkins"
  ON mood_checkins FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view partner mood checkins" ON mood_checkins;
CREATE POLICY "Users can view partner mood checkins"
  ON mood_checkins FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.partner_id = mood_checkins.user_id
    )
  );

DROP POLICY IF EXISTS "Users can insert own mood checkins" ON mood_checkins;
CREATE POLICY "Users can insert own mood checkins"
  ON mood_checkins FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own mood checkins" ON mood_checkins;
CREATE POLICY "Users can update own mood checkins"
  ON mood_checkins FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Memories policies
DROP POLICY IF EXISTS "Users can view own memories" ON memories;
CREATE POLICY "Users can view own memories"
  ON memories FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR partner_id = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS "Users can create memories" ON memories;
CREATE POLICY "Users can create memories"
  ON memories FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid()) AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.partner_id = memories.partner_id
    )
  );

DROP POLICY IF EXISTS "Users can update own memories" ON memories;
CREATE POLICY "Users can update own memories"
  ON memories FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own memories" ON memories;
CREATE POLICY "Users can delete own memories"
  ON memories FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Prompt responses policies
DROP POLICY IF EXISTS "Users can view own responses" ON prompt_responses;
CREATE POLICY "Users can view own responses"
  ON prompt_responses FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view partner responses" ON prompt_responses;
CREATE POLICY "Users can view partner responses"
  ON prompt_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.partner_id = prompt_responses.user_id
    )
  );

DROP POLICY IF EXISTS "Users can create own responses" ON prompt_responses;
CREATE POLICY "Users can create own responses"
  ON prompt_responses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own responses" ON prompt_responses;
CREATE POLICY "Users can update own responses"
  ON prompt_responses FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Calendar events policies
DROP POLICY IF EXISTS "Users can view own events" ON calendar_events;
CREATE POLICY "Users can view own events"
  ON calendar_events FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view partner shared events" ON calendar_events;
CREATE POLICY "Users can view partner shared events"
  ON calendar_events FOR SELECT
  TO authenticated
  USING (
    is_shared = true AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.partner_id = user_id
    )
  );

DROP POLICY IF EXISTS "Users can create own events" ON calendar_events;
CREATE POLICY "Users can create own events"
  ON calendar_events FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own events" ON calendar_events;
CREATE POLICY "Users can update own events"
  ON calendar_events FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own events" ON calendar_events;
CREATE POLICY "Users can delete own events"
  ON calendar_events FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);