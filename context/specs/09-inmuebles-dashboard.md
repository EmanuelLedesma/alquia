# Unidad 9: Refactor del Dashboard de Inmuebles y Alta

## Objetivo
Rediseñar la vista principal (`InmueblesView.jsx`) reemplazando el diseño de tarjeta de ancho completo por una grilla de tarjetas modernas (estilo catálogo). Además, implementar la interfaz para agregar nuevos inmuebles a la base de datos.

## Diseño UI
1. **Header de la vista:** Título "Inmuebles" y subtítulo a la izquierda. A la derecha, un botón primario azul con el texto "+ Nuevo Inmueble".
2. **Grilla (Grid):** Layout responsive usando Tailwind. 1 columna en móvil (`grid-cols-1`), 2 en tablet (`md:grid-cols-2`), y 3 o más en escritorio (`lg:grid-cols-3 gap-6`).
3. **Diseño de Tarjeta (Property Card):**
   - **Imagen superior (Cover):** Alto fijo (ej. `h-48`), con `object-cover` y bordes redondeados arriba. Debe leer la primera URL del array `fotos_urls`. Si no hay foto, mostrar un div gris oscuro de fallback.
   - **Cuerpo:** Título (`nombre`) en negrita, y debajo un extracto de la `descripcion` truncada a 2 líneas (`line-clamp-2`).
   - **Interacción:** Toda la tarjeta debe tener un efecto hover (ej. leve sombra o escala) y al hacer clic debe navegar a la ruta `/inmuebles/:id` (preparando el terreno para la futura vista de detalle).

## Funcionalidad "Nuevo Inmueble"
- El botón de "+ Nuevo Inmueble" debe abrir un Modal superpuesto (con el mismo nivel de `z-index` y fondo oscuro que usamos para el de clientes).
- **Formulario:** Campos para `nombre`, `descripcion` y `texto_disponibilidad` (textareas).
- Al guardar, ejecutar un `insert` en la tabla `inmuebles` usando el cliente de Supabase.
- Manejar el estado de "Cargando...", cerrar el modal tras el éxito, y actualizar el estado local para que la nueva tarjeta aparezca inmediatamente en la grilla sin recargar la página.
- *Nota técnica:* Por el momento, el formulario no incluirá subida de imágenes; estas se pueden seguir administrando desde el Storage de Supabase.