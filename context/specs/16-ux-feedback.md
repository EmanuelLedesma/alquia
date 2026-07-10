# Unidad 16: UX Feedback (Toasts + Skeletons)

## Goal
Reemplazar feedback silencioso y textos "Cargando..." por toasts de confirmación/error y skeleton loaders en las 5 vistas principales del BottomNav.

## Design

### Toast
- Posición: bottom-center, encima del BottomNav (`bottom-20`).
- Duración: 3s auto-dismiss; errores 5s.
- Variantes: success (verde), error (rojo), info (primary).
- Animación: slide-up fade. Tailwind only, sin librería externa.
- API mínima: `showToast(message, variant)` vía contexto React.

### Skeleton
- Color: `bg-slate-200 animate-pulse rounded-xl`.
- Tarjetas inmuebles: rectángulo aspect-[4/3] + 2 líneas texto.
- Listas (clientes, alquileres, gastos): 3–4 filas placeholder.
- Calendario: grilla de celdas grises.

Referencia tokens en `ui-context.md`.

## Implementation

### 1. `ToastContext` + `ToastProvider`
- Crear `src/contexts/ToastContext.jsx` con `showToast(msg, variant)`.
- Renderizar contenedor de toasts con `createPortal` en `AppLayout` o `main.jsx`.

### 2. Integrar toasts en acciones existentes
Agregar toast en al menos:
- Guardar cliente (success/error)
- Guardar reserva (success/error)
- Cambiar estado/seña en AlquileresView (success/error)
- Nuevo movimiento en GastosView (success/error)
- Subir inmueble (success/error)

No refactorizar toda la app — cubrir los flujos principales de mutación.

### 3. Skeleton loaders
Reemplazar `{loading && <p>Cargando...</p>}` por skeleton en:
- `InmueblesView.jsx`
- `ClientesView.jsx`
- `CalendarioView.jsx` / `YearGallery.jsx`
- `AlquileresView.jsx`
- `GastosView.jsx`

Extraer un componente mínimo `Skeleton.jsx` en `src/components/ui/` si reduce duplicación (único componente UI genérico permitido en esta unidad).

## Dependencies
- Unidad 14 completada.
- Sin paquetes npm nuevos.

## Verify when done
- [ ] Toast visible tras guardar cliente y desaparece solo.
- [ ] Toast de error visible si falla un insert Supabase.
- [ ] Skeleton visible mientras carga cada vista principal.
- [ ] Contenido real reemplaza skeleton al terminar fetch.
- [ ] Mobile: toast no queda tapado por BottomNav.
- [ ] `npm run build` pasa.
