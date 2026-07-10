-- Unidad 13: columnas de contacto + CHECK estado en clientes
-- Idempotente: seguro de re-ejecutar en SQL Editor de Supabase.

ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS celular TEXT,
  ADD COLUMN IF NOT EXISTS direccion TEXT,
  ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- Reemplazar CHECK de estado (nombre puede variar según creación original)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'clientes'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%estado%'
  LOOP
    EXECUTE format('ALTER TABLE public.clientes DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.clientes
  ADD CONSTRAINT clientes_estado_check
  CHECK (estado IN ('prospecto', 'activo', 'archivado'));
