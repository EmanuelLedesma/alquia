# Unidad 19: Plantillas de Texto en Supabase

## Goal
Migrar textos pre-armados (disponibilidad, mensajes WhatsApp, etc.) desde localStorage a una tabla `plantillas_texto` en Supabase, sincronizada entre dispositivos.

## Design
- Tabla simple: `id`, `clave` (unique), `contenido`, `updated_at`.
- UI: sección en detalle de inmueble o modal de edición de plantillas.
- Al copiar al portapapeles, leer desde Supabase (con cache en memoria durante la sesión).

## Implementation

### 1. Migración Supabase
```sql
CREATE TABLE plantillas_texto (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clave TEXT UNIQUE NOT NULL,
  contenido TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);
```
RLS: solo usuarios autenticados.

### 2. Migración de datos
- Script one-time: leer localStorage keys conocidas → insert en Supabase.
- ponytail: migración manual documentada, no job automático en runtime.

### 3. Frontend
- Reemplazar lecturas de localStorage por query Supabase.
- Mantener botón "Copiar" existente con Clipboard API.

## Dependencies
- Unidad 13 (RLS patterns).
- Inventariar keys de localStorage actuales antes de implementar.

## Verify when done
- [ ] Editar plantilla en PC → visible en celular tras refresh.
- [ ] Copiar al portapapeles funciona igual que antes.
- [ ] localStorage ya no se usa para plantillas.
