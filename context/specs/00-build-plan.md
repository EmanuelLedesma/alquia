# Plan de Construcción (Build Plan)

## Reglas de Ejecución
- Cada unidad produce un resultado visible y verificable.
- Las dependencias se instalan justo a tiempo; no instalar nada que no sea requerido por la unidad actual.
- No avanzar a la siguiente unidad sin haber cumplido los criterios de verificación de la actual.
- Cada unidad tiene spec en `context/specs/NN-nombre.md` antes de implementarse.

## Estado General
- **Fases 1–4:** Completadas (v0.1 funcional con Supabase).
- **Fase 5 (v0.1.1):** Estabilización — en curso (Unidad 13+).
- **Fase 6 (v0.2):** Mejoras de producto — planificada (Unidades 15–19).

---

## Fase 1: Esqueleto UI y Navegación (Mock Data) ✅

**Unidad 1: Inicialización y App Shell**
- **Qué construye:** Proyecto Vite+React, Tailwind, Lucide. Layout con bottom nav (Inmuebles, Clientes, Reservas, Gastos).
- **Spec:** `01-app-shell.md`
- **Estado:** Completado.

**Unidad 2: Vista de Inmuebles (UI Shell)**
- **Qué construye:** Tarjetas estáticas de dúplex con Clipboard API.
- **Spec:** `02-inmuebles-view.md`
- **Estado:** Completado.

**Unidad 3: Vista de Clientes y Prospectos (UI Shell)**
- **Qué construye:** Tabs Prospectos/Activos, tarjetas expansibles con datos mock.
- **Spec:** `03-clientes-view.md`
- **Estado:** Completado.

---

## Fase 2: Formularios y Lógica de Negocio Financiera (Mock Data) ✅

**Unidad 4: Formulario de Nueva Reserva**
- **Qué construye:** Alta de alquiler con cálculo (Días × Precio) + recambio = Total.
- **Spec:** `04-nueva-reserva.md`
- **Estado:** Completado.

**Unidad 5: Panel de Gestión Contable (Reserva Individual)**
- **Qué construye:** Detalle de reserva con registro de señas y saldo pendiente dinámico.
- **Spec:** `05-gestion-contable.md`
- **Estado:** Completado.

**Unidad 6: Vista de Gastos y Cierre Anual**
- **Qué construye:** Formulario de gastos + resumen ingresos vs gastos por año.
- **Spec:** `06-gastos-cierre.md`
- **Estado:** Completado (UI shell; refactor en Unidad 11).

---

## Fase 3: Integración Backend y Persistencia ✅

**Unidad 7: Integración con Supabase y Autenticación**
- **Qué construye:** Login, AuthContext, ProtectedRoute, cliente Supabase.
- **Spec:** `07-supabase-auth.md`
- **Estado:** Completado.

**Unidad 8: Migración de Vistas a Datos Reales**
- **Qué construye:** Reemplazo de mock data por queries Supabase en todas las vistas.
- **Spec:** `08-data-migration.md`
- **Estado:** Completado.

---

## Fase 4: Funcionalidad Completa + UX ✅

**Unidad 9: Calendario YearGallery + Fixes de Reservas**
- **Qué construye:** YearGallery/MiniMonthGrid/SeasonFilter; fixes timezone, inputs numéricos, validación, Unicode; botones rápidos 7/14/21 días; Calendario en BottomNav.
- **Spec:** *(construido sin spec — comportamiento documentado en progress-tracker)*
- **Estado:** Completado.

**Unidad 10: AlquileresView**
- **Qué construye:** Tabla `/alquileres` con filtros, estados Pagado/Señado/Pendiente, cambio de seña inline, item en BottomNav.
- **Spec:** *(construido sin spec — comportamiento documentado en progress-tracker)*
- **Estado:** Completado.

**Unidad 11: Dashboard Financiero (GastosView)**
- **Qué construye:** KPIs ingresos/gastos/balance, tabla unificada, modal Nuevo Movimiento (Gasto/Ingreso).
- **Spec:** *(construido sin spec — extiende `06-gastos-cierre.md`)*
- **Estado:** Completado.

**Unidad 12: Estabilización Visual + Plan v0.2**
- **Qué construye:** `aspect-[4/3]` en imágenes; archivo `context/v0.2-ideas.md`.
- **Estado:** Completado.

---

## Fase 5: Estabilización v0.1.1

**Unidad 13: Fixes de Base de Datos Supabase**
- **Qué construye:** Migraciones: columnas faltantes en `clientes`, CHECK `estado` con `'archivado'`, bucket `fotos-inmuebles` público con RLS.
- **Spec:** `13-db-fixes.md`
- **SQL:** `supabase/migrations/20260629130000_unit13_clientes.sql`, `20260629130100_unit13_storage_fotos_inmuebles.sql`
- **Dependencias:** Unidad 8.
- **Estado:** Completado.

**Unidad 14: Limpieza de Lib Compartida**
- **Qué construye:** Consolidar `addDays`, `formatCurrency`, `formatDate` en `utils.js`; reemplazar `var` por `const`/`let` en views.
- **Spec:** `14-lib-cleanup.md`
- **Dependencias:** Unidad 13.
- **Estado:** Pendiente.

---

## Fase 6: Roadmap v0.2

**Unidad 15: PWA Básica**
- **Qué construye:** `manifest.json`, meta tags, iconos, install prompt. Sin offline cache aún.
- **Spec:** `15-pwa-basics.md`
- **Dependencias:** Unidad 14.
- **Estado:** Pendiente.

**Unidad 16: UX Feedback (Toasts + Skeletons)**
- **Qué construye:** Componente Toast reutilizable; skeleton loaders en vistas principales.
- **Spec:** `16-ux-feedback.md`
- **Dependencias:** Unidad 14.
- **Estado:** Pendiente.

**Unidad 17: Precios por Temporada**
- **Qué construye:** Columnas `precio_temporada_alta/baja` en `inmuebles`; auto-selección en ReservasView.
- **Spec:** `17-precios-temporada.md` *(crear antes de implementar)*
- **Dependencias:** Unidad 13.
- **Estado:** Planificada.

**Unidad 18: Exportación CSV**
- **Qué construye:** Botón exportar en GastosView → CSV de transacciones filtradas.
- **Spec:** `18-export-csv.md` *(crear antes de implementar)*
- **Dependencias:** Unidad 11.
- **Estado:** Planificada.

**Unidad 19: Plantillas de Texto en Supabase**
- **Qué construye:** Tabla `plantillas_texto`; migrar textos pre-armados desde localStorage.
- **Spec:** `19-plantillas-texto.md` *(crear antes de implementar)*
- **Dependencias:** Unidad 13.
- **Estado:** Planificada.

---

## Navegación Actual (referencia)

| BottomNav | Ruta | Vista |
|-----------|------|-------|
| Inmuebles | `/` | InmueblesView |
| Clientes | `/clientes` | ClientesView |
| Calendario | `/calendario` | CalendarioView → YearGallery |
| Alquileres | `/alquileres` | AlquileresView |
| Gastos | `/gastos` | GastosView |

Rutas contextuales (sin nav item): `/reservas`, `/reservas/:id`, `/inmuebles/:id`, `/login`.
