# Estándares de Código

## Convenciones Generales
- Utilizar JavaScript moderno (ES6+) o TypeScript (recomendado) de forma estricta.
- Los componentes de React deben ser componentes funcionales (Functional Components) utilizando Hooks.
- Nombrar los archivos de componentes en PascalCase (ej. `DuplexCard.jsx`).
- Nombrar funciones y variables en camelCase.

## Estructura de Carpetas
- `/src/components/ui`: Componentes genéricos generados por shadcn/ui.
- `/src/components/features`: Componentes específicos del negocio (ej. `ReservaForm`, `ResumenAnual`).
- `/src/lib`: Funciones utilitarias (ej. cálculos de días, formateo de moneda).
- `/src/services`: Lógica de conexión con Supabase.

## Manejo de Estado y Estilos
- Utilizar Tailwind CSS para todos los estilos mediante el atributo `className`.
- Prohibido el uso de archivos `.css` separados a menos que sea estrictamente necesario para la configuración global.
- Aislar la lógica de cálculo financiero en funciones puras dentro de `/src/lib` antes de inyectarlas en los componentes.
