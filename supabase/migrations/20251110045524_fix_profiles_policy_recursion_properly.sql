/*
  # Fix Profiles Policy Infinite Recursion (Proper Fix)
  
  1. Problem
    - Consolidated policy causes infinite recursion by querying profiles FROM profiles
    - Original logic was: "if auth.uid() = partner_id" (you are someone's partner)
    - Broken logic was: "if your profile has partner_id = this row" (requires querying profiles)
  
  2. Solution
    - Use the original simple logic: auth.uid() = partner_id
    - This means: "show row if current user IS the partner_id of this row"
    - No subqueries needed, no recursion possible
  
  3. Policies
    - Keep them separate to avoid recursion issues
    - Use simple direct checks without subqueries on profiles table
*/

-- Drop the broken policy
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view partner profile" ON profiles;
DROP POLICY IF EXISTS "Users can search profiles by invite code" ON profiles;

-- Recreate with proper simple logic
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can view partner profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = partner_id);

CREATE POLICY "Users can search profiles by invite code"
  ON profiles FOR SELECT
  TO authenticated
  USING (invite_code IS NOT NULL);