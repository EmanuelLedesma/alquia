# Rastreador de Progreso

Actualiza este archivo después de cada cambio significativo de implementación.

## Fase Actual
- Fase 2: Funcionalidad completa con datos reales (Supabase + Calendar + Fixes).

## Objetivo Actual
- Estabilizar formulario de Nueva Reserva: arreglar cálculo de días y total, codificación de textos, y edición de campos numéricos.

## Completado
- [Unidad 1] Inicialización y App Shell (Layout Base) — Completado.
- [Unidad 2] Vista de Inmuebles (UI Shell) — Completado.
- [Unidad 3] Vista de Clientes y Prospectos (UI Shell) — Completado.
- [Unidad 4] Formulario de Nueva Reserva (UI Shell) — Completado.
- [Unidad 5] Panel de Gestión Contable (Reserva Individual) — Completado.
- [Unidad 6] Vista de Gastos y Cierre Anual — Completado.
- [Unidad 7] Integración con Supabase y Autenticación Básica — Completado.
- [Unidad 8] Migración de Vistas a Datos Reales (Supabase) — Completado.
- [Unidad 9] Calendario de disponibilidad + fixes de UX — En progreso.

## En Progreso
- [Unidad 9.1] AvailabilityCalendar componente reusable con MonthGrid, DayDetailSheet.
- [Unidad 9.2] Reemplazo de "Reservas" por "Calendario" en BottomNav.
- [Unidad 9.3] Botones rápidos de duración (7, 14, 21 días) con verificación de overlap.
- [Unidad 9.4] Fix de codificación Unicode en textos de UI.
- [Unidad 9.5] Fix de timezone en `addDays` (parse manual de fecha para evitar desfase UTC-3).
- [Unidad 9.6] Fix de inputs numéricos (`type="text" inputMode="numeric"` para permitir borrar y escribir).
- [Unidad 9.7] Fix de validación visible en formulario (mensaje "Faltan campos requeridos").
- [Unidad 9.8] Fix de cálculo de total (base + recambio) con reactividad correcta.
- [Unidad 9.9] Refactor de calendario a galería por temporada — reemplazo de AvailabilityCalendar por YearGallery con MiniMonthGrid y SeasonFilter.
- [Unidad 9.10] Vista AlquileresView (Gestión de Alquileres) — tabla con filtros (año, inmueble, estado, búsqueda), badges de estado, formato moneda, sin acciones. Ruta `/alquileres` + BottomNav.
- [Unidad 9.11] Mejora AlquileresView: estados cambiados a Pagado/Señado/Pendiente. Nuevas columnas: Seña, Resto, Días. Badge clickeable con dropdown inline para cambiar estado + UPDATE en Supabase. Requiere columna `estado` en `alquileres`.

## Completado Recientemente
- [Unidad 10.1] Dashboard Financiero — Refactor completo de `GastosView.jsx`:
  - KPIs: Ingresos (verde), Gastos (rojo), Balance (color dinámico), filtrados por período.
  - Filtros: Todo el tiempo / Por año / Por mes con selectores condicionales.
  - Tabla de transacciones unificada: combina `senas` (ingresos) y `gastos` (egresos), ordenada por fecha descendente.
  - Modal "+ Nuevo Movimiento" con `createPortal`: Tipo (Gasto/Ingreso) cambia campos dinámicamente.
    - Gasto → insert en `gastos` (inmueble, concepto, monto, fecha).
    - Ingreso → insert en `senas` + update `total_senas_recibidas` en `alquileres`.
  - Sin nuevas tablas ni migraciones. Reusa `gastos` y `senas`.

## Próximo a Hacer
- Bucket `fotos-inmuebles` debe ser público con RLS policies en Supabase Storage.
- Columnas `email`, `celular`, `direccion`, `observaciones` faltantes en `clientes`.
- Actualizar CHECK constraint de `estado` en `clientes` para incluir `'archivado'`.

## Decisiones de Arquitectura
- Se utilizará Supabase como BaaS.
- Se adopta enfoque Mobile-First estricto con PWA.
- Inputs numéricos usan `type="text" inputMode="numeric"` en vez de `type="number"` para evitar bugs de React con valores vacíos.
- Parseo manual de fechas (`split('-')` + `new Date(año, mes-1, día)`) en `addDays` y `diasEntre` para evitar desfase por zona horaria.
- Dropdown de estado en AlquileresView usa `position: fixed` + `getBoundingClientRect()` para no ser cortado por `overflow-x-auto` del contenedor tabla.

## Notas de Sesión
- Se corrigió `addDays` en `ReservasView.jsx`: `new Date(dateStr)` parseaba como UTC, generando fechas incorrectas en huso Argentina (UTC-3). Se reemplazó por parseo manual.
- Se corrigió `diasEntre` en `utils.js`: mismo problema de UTC, mismo fix.
- Se reemplazaron todos los escapes Unicode en `ReservasView.jsx` por caracteres literales.
- Se cambiaron inputs `type="number"` a `type="text" inputMode="numeric"` con filtro `replace(/\D/g, '')`.
- `handleQuickDate` ahora setea `fechaHasta` optimistamente antes de la consulta Supabase, para que el total se vea al instante.
- Se agregó validación visible con mensajes descriptivos ("Faltan campos requeridos: cliente, fecha desde...").
- Refactor completo del calendario: se eliminó `AvailabilityCalendar.jsx` y `MonthGrid.jsx`. Se crearon `YearGallery.jsx` (orquestador con año y filtro), `MiniMonthGrid.jsx` (grilla comprimida de un mes), y `SeasonFilter.jsx` (panel de píldoras para filtrar meses). Default: Dic–Abr (temporada verano Argentina). Selector de año con flechas. Reemplazado en `CalendarioView.jsx` e `InmuebleDetalleView.jsx`.
- Se creó `AlquileresView.jsx` (ruta `/alquileres`, 5to item en BottomNav): tabla de gestión con filtros (año, inmueble, estado, búsqueda).
- Estados cambiados a Pagado/Señado/Pendiente (computados desde total_senas_recibidas vs monto_total). Columnas: Seña, Total (con desglose `días × precio + recambio`), Resto, Días (con rango). Badge clickeable → dropdown inline para cambiar estado: Pagado/Pendiente accion directa, Señado abre input editable para ingresar/modificar monto de la seña.
- Se reemplazaron todos los escapes Unicode en `AlquileresView.jsx` por caracteres literales.
- Se corrigió dropdown de estado cortado: se reemplazó `position: absolute` + `right-0` por `position: fixed` con posicionamiento dinámico vía `getBoundingClientRect()` para sortear el `overflow-x-auto` del contenedor de la tabla.
