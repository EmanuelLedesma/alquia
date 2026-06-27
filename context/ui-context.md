# Contexto de UI y Diseño

## Lenguaje Visual
La aplicación debe tener una estética limpia, profesional y relajante (temática costera), con elementos UI grandes y fáciles de tocar en pantallas móviles.

## Paleta de Colores (Tokens)
- `primary`: #0284c7 (Sky Blue 600) - Botones principales, acciones destacadas.
- `secondary`: #e0f2fe (Sky Blue 100) - Fondos de tarjetas seleccionadas, estados activos.
- `accent`: #f59e0b (Amber 500) - Alertas, señas pendientes, notificaciones.
- `background`: #f8fafc (Slate 50) - Fondo general de la aplicación.
- `surface`: #ffffff (White) - Fondo de tarjetas (dúplex, clientes) y modales.
- `text-main`: #0f172a (Slate 900) - Títulos y textos principales.
- `text-muted`: #64748b (Slate 500) - Descripciones, placeholders y fechas.

## Tipografía y Estructura
- Utilizar la fuente sans-serif por defecto de Tailwind (Inter/System UI).
- Escala de bordes redondeados: `rounded-xl` para tarjetas y modales, `rounded-lg` para botones y campos de formulario.
- Navegación: "Bottom Navigation Bar" (Barra de navegación inferior) fija en dispositivos móviles.

## Convenciones de Componentes
- Todos los componentes interactivos deben usar `shadcn/ui`.
- Iconografía: Utilizar exclusivamente `lucide-react`.
- Los modales o "Drawers" (paneles deslizantes) deben deslizarse desde abajo en pantallas móviles.
