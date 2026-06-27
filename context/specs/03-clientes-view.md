# Unidad 3: Vista de Clientes y Prospectos (UI Shell)

## Objetivo
Construir la pantalla de Clientes (`/clientes`), que mostrará una lista dividida en "Prospectos" y "Clientes Activos" usando datos estáticos. Debe permitir visualizar rápidamente la composición del grupo familiar.

## Diseño
- Uso estricto de mobile-first.
- Implementar un selector tipo "Pestañas" (Tabs) en la parte superior para alternar entre "Activos" y "Prospectos".
- Cada cliente se mostrará como una tarjeta (`Card`) con el fondo blanco (`surface`).
- Destacar visualmente mediante etiquetas (Badges o texto coloreado) si el cliente lleva mascotas (ej. un ícono de patita `PawPrint` o texto "Con Mascota").

## Implementación

### Datos Falsos (Mock Data)
- Crear un array constante con al menos 4 registros (2 prospectos, 2 clientes activos).
- Campos requeridos: `id`, `nombre`, `apellido`, `dni`, `estado` (prospecto/activo), `adultos`, `chicos`, `mascotas` (booleano).

### Componente ClientesView
- Renderizar un control de pestañas (Tabs) o dos botones toggle para cambiar el filtro del array.
- Renderizar la lista filtrada de clientes en tarjetas.
- El cuerpo de la tarjeta debe mostrar: 
  - Nombre completo y DNI.
  - Una fila inferior con íconos o etiquetas que resuma: "👥 X Adultos, Y Chicos" y "🐶 Mascotas: Sí/No".

## Dependencias
- Ninguna nueva. Seguir usando `lucide-react` para los íconos (`Users`, `User`, `PawPrint`, etc.).

## Verificar cuando esté terminado
- [ ] La vista principal muestra el control de pestañas.
- [ ] Al tocar "Prospectos", la lista cambia mostrando solo a los prospectos.
- [ ] Al tocar "Activos", la lista muestra solo a los clientes.
- [ ] La tarjeta resume claramente si la familia tiene mascotas y su composición (adultos/chicos).