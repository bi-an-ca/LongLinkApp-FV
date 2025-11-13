/*
  # Create Storage Buckets for Images
  
  1. Storage Buckets
    - `messages` - For chat message images
    - `memories` - For memory photos
  
  2. Storage Policies
    - Users can upload to their own folders
    - Users can view images from their partner
    - Users can delete their own images
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('messages', 'messages', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('memories', 'memories', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Policies for messages bucket
CREATE POLICY "Users can upload their own chat images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'messages' AND
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "Users can view chat images with partner"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'messages' AND
    (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = (SELECT auth.uid())
        AND profiles.partner_id::text = (storage.foldername(name))[1]
      )
    )
  );

CREATE POLICY "Users can delete their own chat images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'messages' AND
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Policies for memories bucket
CREATE POLICY "Users can upload their own memory images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'memories' AND
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "Users can view memory images with partner"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'memories' AND
    (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = (SELECT auth.uid())
        AND profiles.partner_id::text = (storage.foldername(name))[1]
      )
    )
  );

CREATE POLICY "Users can delete their own memory images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'memories' AND
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

