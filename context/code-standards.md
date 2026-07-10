# Estándares de Código

## Convenciones Generales
- Utilizar JavaScript moderno (ES6+). TypeScript no adoptado en v0.1.
- Usar `const`/`let` — prohibido `var`.
- Los componentes de React deben ser componentes funcionales utilizando Hooks.
- Nombrar los archivos de componentes en PascalCase (ej. `YearGallery.jsx`).
- Nombrar funciones y variables en camelCase.

## Estructura de Carpetas
- `/src/components/ui`: Componentes genéricos reutilizables (ej. Skeleton, Toast).
- `/src/components/calendar`: Componentes del calendario.
- `/src/components/layout`: AppLayout, BottomNav.
- `/src/views`: Vistas por ruta — contienen lógica de fetch y UI de la feature.
- `/src/lib`: Funciones utilitarias puras (cálculos de días, formateo de moneda/fecha).
- `/src/services`: Cliente Supabase singleton.

## Manejo de Estado y Estilos
- Utilizar Tailwind CSS para todos los estilos mediante el atributo `className`.
- Prohibido el uso de archivos `.css` separados a menos que sea estrictamente necesario para la configuración global.
- Aislar la lógica de cálculo financiero en funciones puras dentro de `/src/lib` antes de inyectarlas en los componentes.
