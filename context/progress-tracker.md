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

## Próximo a Hacer
- Verificar que los inserts de Reservas funcionan con todas las columnas requeridas (`costo_recambio`, `cant_dias`, `anio_temporada`).
- Continuar con próximas unidades cuando sea indicado.

## Preguntas Abiertas
- La columna `costo_recambio` requería `ALTER TABLE` en Supabase (ya existe).
- Las columnas `cant_dias` y `anio_temporada` también requerían `ALTER TABLE` (ya existen).

## Decisiones de Arquitectura
- Se utilizará Supabase como BaaS.
- Se adopta enfoque Mobile-First estricto con PWA.
- Inputs numéricos usan `type="text" inputMode="numeric"` en vez de `type="number"` para evitar bugs de React con valores vacíos.
- Parseo manual de fechas (`split('-')` + `new Date(año, mes-1, día)`) en `addDays` y `diasEntre` para evitar desfase por zona horaria.

## Notas de Sesión
- Se corrigió `addDays` en `ReservasView.jsx`: `new Date(dateStr)` parseaba como UTC, generando fechas incorrectas en huso Argentina (UTC-3). Se reemplazó por parseo manual.
- Se corrigió `diasEntre` en `utils.js`: mismo problema de UTC, mismo fix.
- Se reemplazaron todos los escapes Unicode en `ReservasView.jsx` por caracteres literales.
- Se cambiaron inputs `type="number"` a `type="text" inputMode="numeric"` con filtro `replace(/\D/g, '')`.
- `handleQuickDate` ahora setea `fechaHasta` optimistamente antes de la consulta Supabase, para que el total se vea al instante.
- Se agregó validación visible con mensajes descriptivos ("Faltan campos requeridos: cliente, fecha desde...").
