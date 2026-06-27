# Unidad 2: Vista de Inmuebles (UI Shell)

## Objetivo
Construir la pantalla principal ("/"), que mostrará una lista de los inmuebles disponibles (Dúplex A y Dúplex B) usando datos estáticos (hardcodeados). Implementar la funcionalidad de copiar al portapapeles.

## Diseño
- Mantener el enfoque mobile-first.
- Cada inmueble debe mostrarse dentro de una tarjeta (Card).
- Las tarjetas deben tener fondo blanco (`surface`), bordes muy redondeados (`rounded-xl`) y una sombra sutil (`shadow-sm`).
- Las imágenes pueden ser bloques grises de marcador de posición (placeholders).

## Implementación

### Datos Falsos (Mock Data)
- Crear un array constante dentro del archivo con dos objetos: Dúplex A y Dúplex B. Ambos deben tener: ID, Nombre, Descripción corta, y un texto pre-armado de disponibilidad.

### Componente InmueblesView
- Recorrer el array de datos y renderizar un componente de tarjeta para cada uno.
- Cada tarjeta debe mostrar:
  - Imagen (div gris con proporciones de imagen, ej. `aspect-video`).
  - Nombre del dúplex (texto principal oscuro).
  - Descripción corta (texto secundario).

### Funcionalidad de Portapapeles (Clipboard API)
- Agregar un botón en cada tarjeta con el texto "Copiar Disponibilidad" y un ícono de `Copy` o `Share`.
- Al hacer clic, debe usar `navigator.clipboard.writeText()` para copiar el texto pre-armado de disponibilidad de ese dúplex.
- Opcional pero recomendado: Cambiar el texto del botón a "¡Copiado!" por 2 segundos tras el clic para dar feedback visual a la usuaria.

## Dependencias
- Ninguna nueva. Usar íconos de `lucide-react` ya instalados.

## Verificar cuando esté terminado
- [ ] La vista principal muestra dos tarjetas apiladas verticalmente.
- [ ] El diseño se ajusta correctamente a los bordes de la pantalla del móvil.
- [ ] Al hacer clic en "Copiar Disponibilidad", el texto correcto se guarda en el portapapeles del sistema operativo (se puede verificar pegando en un bloc de notas).