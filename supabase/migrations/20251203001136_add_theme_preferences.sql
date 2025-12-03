/*
  # Add Theme Preferences to Profiles
  
  1. Changes
    - Add theme_accent_color column to profiles (default: #F7838D)
    - Add theme_background_color column to profiles (default: #FFECF2)
    - Add theme_blush_color column to profiles (default: #FAC2C6)
  
  2. Purpose
    - Allows users to customize app colors
    - Stores per-user theme preferences
    - Provides sensible defaults for all users
*/

ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS theme_accent_color text DEFAULT '#F7838D',
  ADD COLUMN IF NOT EXISTS theme_background_color text DEFAULT '#FFECF2',
  ADD COLUMN IF NOT EXISTS theme_blush_color text DEFAULT '#FAC2C6';
