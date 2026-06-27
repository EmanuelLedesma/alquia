# Unidad 8: Migración de Vistas a Datos Reales (Supabase)

## Objetivo
Reemplazar de manera sistemática todos los datos de prueba (mock data) de la aplicación por consultas y mutaciones reales utilizando el cliente de Supabase instalado en la Unidad 7. Las operaciones deben respetar las políticas RLS activadas.

## Diseño
No se alterará ningún componente visual ni los estilos maquetados en las fases anteriores. La interfaz debe seguir siendo idéntica, pero cargando datos desde el servidor en la nube.

## Implementación

### 1. InmueblesView (`/`)
- Al montar el componente, realizar un `select` a la tabla `inmuebles`.
- Reemplazar el array estático por el estado que devuelva la base de datos.
- *Nota:* Si la tabla está vacía en Supabase, la app mostrará una pantalla limpia. (Opcional: puedes insertar manualmente Dúplex A y Dúplex B desde el Table Editor de Supabase para probar).

### 2. ClientesView (`/clientes`)
- Cambiar la lectura de prospectos y clientes activos para que haga un `select` a la tabla `clientes`.
- Al mutar o registrar un cliente, realizar un `insert` a la tabla `clientes`.

### 3. Reservas y Gastos (`/reservas` y `/gastos`)
- Migrar los formularios de Nueva Reserva y Carga de Gastos para que ejecuten operaciones `insert` relacionales contra sus respectivas tablas (`alquileres` y `gastos`).
- En el detalle de la reserva, el registro de una seña debe actualizar el campo `total_senas_recibidas` y recalculas en React el saldo pendiente como se especificó en la Unidad 5.

## Dependencias
- Ninguna nueva. Usar el cliente inicializado en `src/services/supabase.js`.

## Verificar cuando esté terminado
- [ ] Al iniciar la aplicación y loguearse, las pantallas cargan sin romper el renderizado.
- [ ] Es posible añadir un cliente desde la app y verificar que aparece instantáneamente en el panel de Supabase.
- [ ] Las reservas calculan y guardan los datos financieros de forma persistente en la nube.