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

## En Progreso
- Ninguno.

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
- Mobile-first estricto; bottom nav con 5 items: Inmuebles, Clientes, Calendario, Alquileres, Gastos.
- `/reservas` accesible solo por navegación contextual (Calendario, Alquileres +, YearGallery) — no está en BottomNav.
- UI: Tailwind CSS custom con `createPortal` para modales. **No shadcn/ui instalado** (decisión v0.1.1).
- Inputs numéricos: `type="text" inputMode="numeric"` + filtro `replace(/\D/g, '')`.
- Fechas: parseo manual local (`split('-')` + `new Date(año, mes-1, día)`) — nunca `new Date(isoString)`.
- Dropdown de estado en AlquileresView: `position: fixed` + `getBoundingClientRect()`.
- Cálculos financieros en funciones puras dentro de `/src/lib`.

## Notas de Sesión (última)
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
