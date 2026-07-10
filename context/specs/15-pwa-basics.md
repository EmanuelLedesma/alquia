# Unidad 15: PWA Básica

## Goal
Permitir instalar Alquia en el home screen del celular mediante manifest + meta tags. Sin service worker ni cache offline en esta unidad.

## Design
- Nombre corto: "Alquia"
- Tema: `theme-color` = `#0284c7` (primary)
- Fondo: `#f8fafc` (background)
- Iconos: mínimo 192×192 y 512×512 en `/public/icons/`
- Display: `standalone`

Referencia tokens en `ui-context.md`.

## Implementation

### 1. `public/manifest.json`
```json
{
  "name": "Alquia",
  "short_name": "Alquia",
  "description": "Gestión de alquileres temporarios",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f8fafc",
  "theme_color": "#0284c7",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 2. `index.html`
- `<link rel="manifest" href="/manifest.json">`
- `<meta name="theme-color" content="#0284c7">`
- `<meta name="apple-mobile-web-app-capable" content="yes">`
- `<link rel="apple-touch-icon" href="/icons/icon-192.png">`

### 3. Iconos
- Crear iconos placeholder simples (fondo primary, letra "A" blanca) o usar SVG exportado a PNG.
- Ubicación: `public/icons/`.

### 4. Vite
- Verificar que `public/` se copia a `dist/` en build.

## Dependencies
- Unidad 14 completada.
- Sin paquetes npm (PWA manual, sin vite-plugin-pwa por ahora).

## Verify when done
- [ ] `npm run build` y `npm run preview` — manifest accesible en `/manifest.json`.
- [ ] Chrome DevTools → Application → Manifest muestra datos correctos.
- [ ] En móvil (o emulación): opción "Instalar app" / "Add to Home Screen" disponible.
- [ ] App instalada abre en `/` con barra de navegación del sistema oculta (standalone).
