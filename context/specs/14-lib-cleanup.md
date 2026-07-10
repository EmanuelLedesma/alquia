# Unidad 14: Limpieza de Lib Compartida

## Goal
Consolidar helpers duplicados en `src/lib/utils.js` y reemplazar `var` por `const`/`let` en todas las views, sin cambiar comportamiento.

## Design
- Sin cambios visuales.
- Refactor interno únicamente.

## Implementation

### 1. Mover a `utils.js`
Extraer y exportar desde un solo lugar:

| Función | Origen actual | Notas |
|---------|---------------|-------|
| `addDays(dateStr, days)` | `ReservasView.jsx` (local) | Parseo manual local, igual que `diasEntre` |
| `formatCurrency(n)` | `AlquileresView.jsx`, `GastosView.jsx` | `'$' + Number(n).toLocaleString('es-AR')` |
| `formatDate(iso)` | `AlquileresView.jsx`, `GastosView.jsx`, `YearGallery.jsx` | `DD/MM/YYYY` desde ISO |

Actualizar imports en todas las views afectadas.

### 2. Reemplazar `var` → `const`/`let`
Archivos pendientes (usar `const` por defecto, `let` solo si se reasigna):
- `src/lib/utils.js`
- `src/views/ReservasView.jsx`
- `src/views/AlquileresView.jsx`
- `src/views/GastosView.jsx`
- `src/components/calendar/YearGallery.jsx`

No tocar views que ya usan `const`/`let` salvo para actualizar imports.

### 3. No hacer (fuera de alcance)
- No crear hooks custom (`useSenias`, etc.) — eso queda para v0.2.
- No migrar a TypeScript.
- No extraer componentes de views monolíticas.

## Dependencies
- Unidad 13 completada (opcional pero recomendado antes de refactor).

## Verify when done
- [ ] `npm run build` pasa.
- [ ] Crear reserva: fechas y total siguen correctos.
- [ ] AlquileresView: moneda y fechas se muestran igual.
- [ ] GastosView: KPIs y tabla muestran montos igual.
- [ ] Calendario: fechas en DayDetailSheet sin cambios.
- [ ] Grep `^\s*var ` en `src/` retorna 0 resultados.
