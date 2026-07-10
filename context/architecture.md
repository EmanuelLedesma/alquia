# Arquitectura

## Stack Tecnológico

| Capa | Tecnología | Rol |
|------|------------|-----|
| Frontend | React 19 + Vite 6 | SPA mobile-first |
| Routing | react-router-dom 7 | Navegación client-side |
| Estilos | Tailwind CSS 3 | Utility-first, tokens en `tailwind.config.js` |
| Iconos | lucide-react | Iconografía exclusiva |
| UI Components | Tailwind custom | Modales vía `createPortal`. **No shadcn/ui** (decisión v0.1.1) |
| Backend/DB | Supabase | PostgreSQL + Auth + Storage |
| Hosting | Netlify o Vercel | Deploy estático de `dist/` |

## Estructura de Carpetas

```
src/
├── components/
│   ├── auth/          # ProtectedRoute
│   ├── calendar/      # YearGallery, MiniMonthGrid, SeasonFilter, DayDetailSheet
│   └── layout/        # AppLayout, BottomNav
├── contexts/          # AuthContext
├── lib/               # utils.js — cálculos y formateo puros
├── services/          # supabase.js — cliente singleton
└── views/             # Una vista por ruta principal
context/               # Six-file context system + specs
```

## Modelo de Datos (Supabase)

| Tabla | Propósito |
|-------|-----------|
| `inmuebles` | Dúplex: nombre, descripción, fotos, precio, texto disponibilidad, `costo_recambio` |
| `clientes` | Personas: datos contacto, estado (prospecto/activo/archivado), grupo familiar |
| `alquileres` | Reservas: fechas, montos, señas recibidas, inmueble_id, cliente_id |
| `senas` | Pagos parciales vinculados a un alquiler |
| `gastos` | Egresos por inmueble: concepto, monto, fecha |

Storage bucket: `fotos-inmuebles` — fotos de inmuebles.

## Modelo de Almacenamiento
- Todo el estado persistente vive en Supabase.
- No se usa LocalStorage para datos de negocio (sincronización celular ↔ PC).
- Excepción pendiente de migrar: textos pre-armados aún en localStorage → Unidad 19.

## Auth y Acceso
- Single-user: una cuenta administradora.
- `AuthContext` + `ProtectedRoute` envuelven todas las rutas excepto `/login`.
- RLS en Supabase debe restringir acceso a usuarios autenticados.

## Invariantes
- La aplicación es de uso privado; todas las rutas y mutaciones requieren autenticación.
- Todo cálculo financiero (totales, saldos) debe realizarse de forma consistente y evitar errores de redondeo.
- Fechas ISO (`YYYY-MM-DD`) se parsean siempre en hora local — nunca `new Date(isoString)`.
- Inputs numéricos usan `type="text" inputMode="numeric"`, no `type="number"`.
- No instalar bibliotecas de terceros sin autorización explícita previa.
- Lógica financiera en funciones puras en `/src/lib` antes de inyectarla en componentes.
