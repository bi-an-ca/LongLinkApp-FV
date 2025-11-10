/*
  # Consolidate Multiple Permissive SELECT Policies
  
  1. Policy Consolidation
    - Combine multiple SELECT policies into single policies using OR logic
    - Maintains exact same functionality while eliminating "multiple permissive policies" warnings
    - Improves query planner efficiency
  
  2. Tables Updated
    - profiles: 3 SELECT policies → 1 SELECT policy
    - mood_checkins: 2 SELECT policies → 1 SELECT policy
    - prompt_responses: 2 SELECT policies → 1 SELECT policy
    - calendar_events: 2 SELECT policies → 1 SELECT policy
*/

-- Profiles: Consolidate 3 SELECT policies into 1
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view partner profile" ON profiles;
DROP POLICY IF EXISTS "Users can search profiles by invite code" ON profiles;

CREATE POLICY "Users can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    -- Can view own profile
    (SELECT auth.uid()) = id
    OR
    -- Can view partner profile
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = (SELECT auth.uid())
      AND p.partner_id = profiles.id
    )
    OR
    -- Can search profiles by invite code (for pairing)
    invite_code IS NOT NULL
  );

-- Mood checkins: Consolidate 2 SELECT policies into 1
DROP POLICY IF EXISTS "Users can view own mood checkins" ON mood_checkins;
DROP POLICY IF EXISTS "Users can view partner mood checkins" ON mood_checkins;

CREATE POLICY "Users can view mood checkins"
  ON mood_checkins FOR SELECT
  TO authenticated
  USING (
    -- Can view own mood checkins
    user_id = (SELECT auth.uid())
    OR
    -- Can view partner mood checkins
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.partner_id = mood_checkins.user_id
    )
  );

-- Prompt responses: Consolidate 2 SELECT policies into 1
DROP POLICY IF EXISTS "Users can view own responses" ON prompt_responses;
DROP POLICY IF EXISTS "Users can view partner responses" ON prompt_responses;

CREATE POLICY "Users can view prompt responses"
  ON prompt_responses FOR SELECT
  TO authenticated
  USING (
    -- Can view own responses
    user_id = (SELECT auth.uid())
    OR
    -- Can view partner responses
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.partner_id = prompt_responses.user_id
    )
  );

-- Calendar events: Consolidate 2 SELECT policies into 1
DROP POLICY IF EXISTS "Users can view own events" ON calendar_events;
DROP POLICY IF EXISTS "Users can view partner shared events" ON calendar_events;

CREATE POLICY "Users can view calendar events"
  ON calendar_events FOR SELECT
  TO authenticated
  USING (
    -- Can view own events
    (SELECT auth.uid()) = user_id
    OR
    -- Can view partner's shared events
    (
      is_shared = true AND
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = (SELECT auth.uid())
        AND profiles.partner_id = user_id
      )
    )
  );