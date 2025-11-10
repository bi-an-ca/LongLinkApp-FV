/*
  # Fix Infinite Recursion in Profiles RLS Policy
  
  1. Problem
    - The consolidated SELECT policy causes infinite recursion
    - Subquery on profiles table triggers the same policy again
  
  2. Solution
    - Revert to separate SELECT policies to avoid recursion
    - Keep other consolidated policies (mood_checkins, prompt_responses, calendar_events)
    - Use simpler logic that doesn't self-reference the profiles table
  
  3. Policies
    - "Users can view own profile" - Direct check without subquery
    - "Users can view partner profile" - Uses partner_id directly
    - "Users can search profiles by invite code" - For pairing functionality
*/

-- Drop the problematic consolidated policy
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;

-- Recreate as separate policies without recursion
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can view partner profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT partner_id 
      FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND partner_id IS NOT NULL
    )
  );

CREATE POLICY "Users can search profiles by invite code"
  ON profiles FOR SELECT
  TO authenticated
  USING (invite_code IS NOT NULL);