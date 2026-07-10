# Unidad 17: Precios por Temporada

## Goal
Agregar precios de temporada alta/baja por inmueble y auto-seleccionar el precio correcto al crear una reserva según las fechas elegidas.

## Design
- Temporada alta default: Diciembre–Marzo (meses 12, 1, 2, 3).
- En ReservasView: al cambiar fechas, el precio/día se actualiza automáticamente.
- Mostrar badge "Temporada alta" / "Temporada baja" junto al precio.

## Implementation

### 1. Migración Supabase
Agregar a `inmuebles`:
- `precio_temporada_alta` NUMERIC
- `precio_temporada_baja` NUMERIC

Migrar valor actual de `precio` a ambas columnas como default inicial.

### 2. `InmueblesView` / detalle
- Campos editables para ambos precios en formulario de inmueble.

### 3. `ReservasView`
- Función pura `getPrecioTemporada(fechaDesde, inmueble)` en `utils.js`.
- Al seleccionar inmueble + fechas, setear precio/día automáticamente.
- Usuario puede override manual del precio (mantener input editable).

## Dependencies
- Unidad 13 (migraciones DB).
- Confirmar regla de meses alta/baja con usuaria antes de implementar.

## Verify when done
- [ ] Reserva en enero usa precio alta.
- [ ] Reserva en junio usa precio baja.
- [ ] Total recalcula al cambiar fechas.
- [ ] Precios persisten en Supabase por inmueble.
