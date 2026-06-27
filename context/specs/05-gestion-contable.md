# Unidad 5: Panel de Gestión Contable (Reserva Individual)

## Objetivo
Construir la pantalla de detalle de una reserva específica (`/reservas/:id`), que permita visualizar el resumen del alquiler, registrar pagos parciales (señas) y recalcular automáticamente el "Saldo Neto Pendiente".

## Diseño
- Mantener la coherencia mobile-first.
- Dividir la vista en tres secciones visuales claras usando tarjetas (`Card`):
  1. **Resumen:** Cliente, Inmueble, Fechas y Monto Total.
  2. **Historial de Pagos:** Lista de las señas ya entregadas (con fecha y monto).
  3. **Nueva Seña:** Un pequeño formulario (input numérico y botón) para registrar un nuevo pago.
- Destacar el **Saldo Neto Pendiente** en grande, utilizando el color `accent` (Amber) si hay deuda, o verde/primary si está saldado (0).

## Implementación

### Datos de Prueba (Mock Data)
- Simular un objeto de reserva activo. Ejemplo: Monto Total de $500,000, con un array `senas` que contenga dos pagos previos (ej. uno de $50,000 y otro de $100,000).

### Lógica Contable
- Crear un estado local para el array de señas.
- El **Total Pagado** es la suma de todos los montos en el array de señas.
- El **Saldo Neto Pendiente** se calcula dinámicamente como: `Monto Total - Total Pagado`.
- Al usar el formulario de "Nueva Seña", el nuevo monto debe agregarse al array de señas y la interfaz debe recalcular el saldo automáticamente.

## Dependencias
- Ninguna nueva.

## Verificar cuando esté terminado
- [ ] La vista muestra correctamente el desglose de la reserva y el historial de pagos.
- [ ] La matemática inicial es correcta (ej. si el total es 500k y hay 150k en señas, el saldo debe decir 350k).
- [ ] Al cargar una nueva seña y presionar el botón de agregar, la lista de pagos se actualiza, el total pagado sube y el saldo neto pendiente baja instantáneamente.