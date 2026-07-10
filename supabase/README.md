# Supabase — Migraciones

## Aplicar Unidad 13 (fixes DB)

1. Abrí [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto → **SQL Editor**.
2. Ejecutá en orden:
   - `migrations/20260629130000_unit13_clientes.sql`
   - `migrations/20260629130100_unit13_storage_fotos_inmuebles.sql`
3. Verificá en la app (logueada):
   - Crear/editar cliente con email, celular, dirección, observaciones.
   - Archivar un cliente (tab Archivados).
   - Subir foto en Inmuebles → la imagen se ve en la tarjeta.

Las migraciones son idempotentes: podés re-ejecutarlas sin romper un entorno ya migrado.
