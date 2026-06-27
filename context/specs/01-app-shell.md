# Unidad 1: Inicialización y App Shell (Layout Base)

## Objetivo
Inicializar el proyecto de React y crear la estructura visual principal (Layout) de la aplicación, implementando un diseño "mobile-first" que incluya una barra de navegación inferior fija (Bottom Navigation Bar) para moverse entre las vistas principales. No conectar a base de datos.

## Diseño
- El diseño es estrictamente para uso en dispositivos móviles.
- Utilizar el color de fondo definido como `background` (Slate 50) para la aplicación.
- La barra de navegación inferior debe tener fondo blanco (`surface`) con un ligero sombreado en la parte superior para separarla del contenido.
- Los íconos inactivos en la barra de navegación deben usar el color `text-muted` (Slate 500) y el ícono activo debe usar `primary` (Sky Blue 600).

## Implementación

### Configuración del Proyecto
- Inicializar proyecto React usando Vite.
- Configurar Tailwind CSS de forma estándar.
- Configurar la utilidad básica para clases (típicamente `cn` con `clsx` y `tailwind-merge` usado por shadcn/ui).

### Enrutamiento (Routing)
- Implementar React Router (o sistema de enrutamiento basado en estado simple si se prefiere evitar dependencias extra en esta fase temprana, pero React Router es recomendado).
- Definir 4 rutas vacías: `/` (Inmuebles), `/clientes` (Clientes), `/reservas` (Reservas), `/gastos` (Gastos).

### Componente Layout Principal (`AppLayout.jsx` o similar)
- Crear un contenedor principal que ocupe `100vh` y evite el scroll del body general si la vista interna no lo requiere.
- El área de contenido (Main) debe tener padding inferior (aprox `pb-20`) para que la barra de navegación no tape el contenido final al hacer scroll.

### Barra de Navegación Inferior (`BottomNav.jsx`)
- Contenedor posicionado con `fixed bottom-0 w-full`.
- Incluir 4 botones distribuidos uniformemente (`justify-around`).
- Cada botón debe mostrar un ícono de `lucide-react` y una etiqueta de texto muy pequeña debajo:
  - Inmuebles: Ícono `Home`
  - Clientes: Ícono `Users`
  - Reservas: Ícono `CalendarCheck`
  - Gastos: Ícono `ReceiptText` o `Wallet`
- Implementar la lógica para cambiar la vista activa al tocar.

## Dependencias
- `react-router-dom` (Para la navegación entre vistas).
- `lucide-react` (Para la iconografía).
- `clsx` y `tailwind-merge` (Utilidades base para estilos dinámicos de Tailwind).

## Verificar cuando esté terminado
- [ ] El comando `npm run dev` levanta el servidor sin errores.
- [ ] No hay errores de JavaScript en la consola del navegador.
- [ ] La barra de navegación inferior se mantiene fija al fondo de la pantalla simulada de un móvil.
- [ ] Al hacer clic en cada ícono de la barra, la pantalla central cambia para indicar en qué vista se encuentra (ej. texto simple que diga "Vista de Reservas").
- [ ] El ícono activo cambia de color correctamente a azul (`primary`).
