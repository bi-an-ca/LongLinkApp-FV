/*
  # Add Theme Preferences to Profiles
  
  Add theme customization columns to profiles table:
  - theme_accent_color - Main accent color (buttons, highlights)
  - theme_background_color - Background color
  - theme_blush_color - Secondary accent color
*/

ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS theme_accent_color text DEFAULT '#F7838D',
  ADD COLUMN IF NOT EXISTS theme_background_color text DEFAULT '#FFECF2',
  ADD COLUMN IF NOT EXISTS theme_blush_color text DEFAULT '#FAC2C6';

