-- Unidad 13: bucket fotos-inmuebles público + RLS para authenticated
-- Idempotente: seguro de re-ejecutar en SQL Editor de Supabase.

INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos-inmuebles', 'fotos-inmuebles', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "fotos_inmuebles_public_select" ON storage.objects;
DROP POLICY IF EXISTS "fotos_inmuebles_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "fotos_inmuebles_authenticated_select" ON storage.objects;

-- Lectura pública (getPublicUrl en <img> sin token)
CREATE POLICY "fotos_inmuebles_public_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'fotos-inmuebles');

-- Upload solo usuarios autenticados
CREATE POLICY "fotos_inmuebles_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'fotos-inmuebles');

-- SELECT explícito para authenticated (spec Unidad 13)
CREATE POLICY "fotos_inmuebles_authenticated_select"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'fotos-inmuebles');
