# Rastreador de Progreso

Actualiza este archivo después de cada cambio significativo de implementación.

## Fase Actual
- Fase 3: Estabilización (v0.1.1) + Roadmap v0.2.

## Objetivo Actual
- Unidad 13 completada. Próxima unidad de código: **Unidad 14 — Limpieza de lib compartida**.

## Completado

### Fase 1 — Esqueleto UI (Mock Data)
- [Unidad 1] Inicialización y App Shell — Completado.
- [Unidad 2] Vista de Inmuebles (UI Shell) — Completado.
- [Unidad 3] Vista de Clientes y Prospectos (UI Shell) — Completado.

### Fase 2 — Formularios y Lógica Financiera (Mock Data)
- [Unidad 4] Formulario de Nueva Reserva (UI Shell) — Completado.
- [Unidad 5] Panel de Gestión Contable (Reserva Individual) — Completado.
- [Unidad 6] Vista de Gastos y Cierre Anual (UI Shell) — Completado.

### Fase 3 — Integración Backend
- [Unidad 7] Integración con Supabase y Autenticación — Completado.
- [Unidad 8] Migración de Vistas a Datos Reales — Completado.

### Fase 4 — Funcionalidad Completa + UX
- [Unidad 9] Calendario YearGallery + fixes de reservas (timezone, inputs, validación, Unicode) — Completado.
- [Unidad 10] AlquileresView — tabla con filtros, estados Pagado/Señado/Pendiente, dropdown de seña — Completado.
- [Unidad 11] Dashboard Financiero — refactor de GastosView (KPIs, transacciones unificadas, modal Nuevo Movimiento) — Completado.
- [Unidad 12] Estabilización visual — `aspect-[4/3]` en imágenes; plan v0.2 en `context/v0.2-ideas.md` — Completado.

### Fase 5 — Estabilización v0.1.1
- [Unidad 12.1] Re-sync documental — progress-tracker, build plan, specs 13–19 — Completado.
- [Unidad 13] Fixes de base de datos Supabase — migraciones en `supabase/migrations/` — Completado.
- [Unidad 13.1] Fixes post-merge: fecha_hasta exclusiva en calendario, timezone UTC-3 en display de fechas, recambio resta del total, auto-fill inmueble al reservar desde calendario, skip modal en días libres — Completado.
- [Unidad 14.5] Panel de Control — reemplaza Panel de Inmuebles en `/`. `costo_recambio` ahora vive en `inmuebles` y autocompleta en reservas. Galería multi-foto, métricas inline por inmueble (reservas + ingresos del año), accesos rápidos, resumen del mes, próximas reservas, alertas de pendientes. BottomNav: "Inmuebles" → "Control" — Completado.

## En Progreso
- Ninguno.

## Fixes Aplicados
- `ReservasView.jsx`:
  - Se definió `inmuebleNombre` como variable derivada (antes causaba `ReferenceError` al crear gasto de recambio, bloqueando navegación y dejando botón habilitado → duplicación de reservas).
  - Se agregó estado `submitting` con guard clause en `handleSubmit`, botón deshabilitado mientras envía, y texto "Guardando...".
  - Se desacopló la navegación de la inserción de gastos: `navigate('/calendario')` ocurre siempre que el alquiler se creó, sin esperar el gasto de recambio.
  - Navegación post-guardado cambió de `/reservas/:id` a `/calendario` (último lugar visitado).
- `AlquileresView.jsx`:
  - Columnas Seña y Total invertidas en tabla y en `tfoot`.
  - `handlePagado`, `handleAgregarSena`, `handleEditarTotal`: ahora insertan en `gastos` con `categoria: 'alquiler'`.

## Próximo a Hacer
1. [Unidad 14] Limpieza de lib compartida — ver `context/specs/14-lib-cleanup.md`.
2. [Unidad 15] PWA básica — ver `context/specs/15-pwa-basics.md`.
3. [Unidad 16] UX feedback (toasts + skeletons) — ver `context/specs/16-ux-feedback.md`.

## Open Questions
- ¿Instalar shadcn/ui en v0.2 o mantener Tailwind custom? (Decisión tomada: mantener Tailwind custom por ahora — ver `architecture.md`).
- ¿Precios por temporada: Dic–Mar = alta y resto = baja, o reglas distintas por inmueble?
- ¿PWA offline: cachear solo shell o también datos recientes de Supabase?

## Decisiones de Arquitectura
- Supabase como BaaS; auth single-user con rutas protegidas.
- Mobile-first estricto; bottom nav con 5 items: Control, Clientes, Calendario, Alquileres, Gastos.
- `/reservas` accesible solo por navegación contextual (Calendario, Alquileres +, YearGallery) — no está en BottomNav.
- UI: Tailwind CSS custom con `createPortal` para modales. **No shadcn/ui instalado** (decisión v0.1.1).
- Inputs numéricos: `type="text" inputMode="numeric"` + filtro `replace(/\D/g, '')`.
- Fechas: parseo manual local (`split('-')` + `new Date(año, mes-1, día)`) — nunca `new Date(isoString)`.
- Dropdown de estado en AlquileresView: `position: fixed` + `getBoundingClientRect()`.
- Cálculos financieros en funciones puras dentro de `/src/lib`.

## Notas de Sesión (última)
- Unidad 14.5 (2026-07-10): Panel de Control.
  - `inmuebles.costo_recambio` (numeric) agregado vía `scripts/add_costo_recambio_inmuebles.sql`. Aplicar en Supabase SQL Editor.
  - `PanelControlView.jsx` reemplaza a `InmueblesView.jsx` (borrado). Ruta `/` ahora abre el panel con: header, 4 accesos rápidos, 3 KPIs del mes, top 3 próximas reservas, alertas de pendientes, grid de cards de inmuebles.
  - Cards de inmuebles: carrusel multi-foto (swipe via chevron + dots), badge recambio editable inline (autosave onBlur), métricas inline (reservas año + ingresos año).
  - `InmuebleDetalleView.jsx`: chip recambio read-only, galería completa con dots y navegación.
  - `ReservasView.jsx`: `select('id, nombre, costo_recambio')`; al elegir inmueble con `costo_recambio > 0` y campo recambio vacío, autollena. Editable por el usuario.
  - `BottomNav.jsx`: label "Inmuebles" → "Control".
  - `App.jsx`: import + ruta actualizados.
- Unidad 13.1 (2026-07-09): Fixes de bugs en calendario y reservas.
  - `MiniMonthGrid.jsx`/`YearGallery.jsx`: `day < r._hasta` en vez de `<=` — el último día (checkout) queda libre.
  - `DayDetailSheet.jsx`/`ReservasView.jsx`/`ReservaDetalleView.jsx`: `new Date(isoString)` → `new Date(+p[0], +p[1]-1, +p[2])` para evitar shift de UTC-3 en Argentina.
  - `ReservasView.jsx`: `total = dias * pNum - cNum` — el recambio ahora resta en vez de sumar.
  - `YearGallery.jsx`: día libre → navega directo a `/reservas` con `inmuebleId` pre-seleccionado (vía `clickSourceId`). Día ocupado → modal como antes. Se eliminó el paso intermedio del modal para días libres.
- Unidad 13 (2026-06-29): migraciones SQL idempotentes en `supabase/migrations/` (clientes + storage). Aplicar vía SQL Editor — ver `supabase/README.md`.
- Fixes previos de reservas: timezone UTC-3, inputs numéricos, validación visible, total reactivo.
- Calendario: YearGallery + MiniMonthGrid + SeasonFilter reemplazaron AvailabilityCalendar. Default temporada: Dic–Abr.
- AlquileresView: estados computados, columnas Seña/Resto/Días, cambio de seña inline con UPDATE en Supabase.
- GastosView: dashboard con KPIs, tabla unificada senas+gastos, modal dual Gasto/Ingreso.
