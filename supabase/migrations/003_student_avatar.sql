ALTER TABLE public.students ADD COLUMN IF NOT EXISTS avatar_url TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('student-avatars', 'student-avatars', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif'];

CREATE POLICY "student_avatars_read_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'student-avatars');
CREATE POLICY "student_avatars_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'student-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "student_avatars_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'student-avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'student-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "student_avatars_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'student-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
