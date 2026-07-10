# Unidad 13: Fixes de Base de Datos Supabase

## Goal
Aplicar las migraciones pendientes en Supabase para que las features ya construidas en el frontend funcionen sin errores: columnas de contacto en `clientes`, estado `archivado`, y bucket de fotos público con RLS.

## Design
- Sin cambios de UI.
- Migraciones ejecutadas en Supabase Dashboard o vía SQL script documentado en el repo.

## Implementation

### 1. Tabla `clientes` — columnas faltantes
Agregar si no existen:
- `email` TEXT
- `celular` TEXT
- `direccion` TEXT
- `observaciones` TEXT

`ClientesView.jsx` ya envía estos campos en insert/update.

### 2. Tabla `clientes` — CHECK constraint de `estado`
Actualizar constraint para permitir: `'prospecto'`, `'activo'`, `'archivado'`.

`ClientesView.jsx` ya filtra por tab `archivado`.

### 3. Storage bucket `fotos-inmuebles`
- Bucket público (lectura) o signed URLs según preferencia.
- RLS policy: usuarios autenticados pueden `INSERT` y `SELECT`.
- Verificar que `InmueblesView.jsx` upload + public URL funciona tras el cambio.

### 4. Documentación
- Guardar SQL de migración en `supabase/migrations/` (crear carpeta si no existe) o documentar en nota al pie de esta spec en progress-tracker.

## Dependencies
- Acceso al proyecto Supabase (Dashboard o CLI).
- Ningún paquete npm nuevo.

## Verify when done
- [ ] Insert/update de cliente con email, celular, direccion, observaciones no falla.
- [ ] Cambiar cliente a estado `archivado` persiste correctamente.
- [ ] Subir foto de inmueble desde InmueblesView muestra la imagen en la tarjeta.
- [ ] Sin errores en consola al operar clientes e inmuebles.
- [ ] SQL de migración documentado en el repo.
