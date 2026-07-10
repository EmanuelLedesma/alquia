# Resumen del Proyecto

## Visión General
Aplicación web progresiva (PWA) sencilla, "mobile-first", para la administración de alquileres temporarios de dúplex en la costa, operada por una única usuaria administradora.

## Objetivos
1. Reemplazar el registro manual contable.
2. Calcular automáticamente días de estadía, costos, registro de señas y saldos netos pendientes.
3. Generar balances anuales de ingresos cruzados con gastos fijos/variables por dúplex.

## Flujo Principal del Usuario
1. **Login** — Ingreso con email/contraseña (Supabase Auth).
2. **Inmuebles** — Ver catálogo de dúplex, copiar texto de disponibilidad, crear/editar inmuebles.
3. **Clientes** — Gestionar prospectos, clientes activos y archivados.
4. **Calendario** — Ver disponibilidad por temporada (YearGallery), crear reserva desde día libre.
5. **Nueva Reserva** (`/reservas`) — Seleccionar cliente, inmueble, fechas; cálculo automático de total; guardar en Supabase.
6. **Alquileres** — Tabla de reservas con filtros; cambiar estado de pago (Pagado/Señado/Pendiente) y registrar señas.
7. **Gastos** — Dashboard financiero con KPIs, movimientos unificados, alta de gastos e ingresos.

## En Alcance
- Gestión unificada de prospectos y clientes.
- Carga de reservas con cálculo de precio base, señas y deducción del pago fijo a la "chica del recambio".
- Registro de gastos por inmueble.
- Calendario de disponibilidad por temporada.
- Tabla de gestión de alquileres con estados de pago.
- Dashboard financiero con ingresos, gastos y balance por período.
- Implementación de Clipboard API para copiar textos pre-armados y enlaces de fotos.

## Fuera de Alcance
- Integración nativa con APIs de WhatsApp o Email.
- Pasarelas de pago externas (MercadoPago, Stripe, etc.).
- Sistema de reservas de cara al cliente final (es estrictamente de uso interno).
- Multi-usuario o roles distintos de administrador.

## Criterios de Éxito (v0.1)
- [ ] Una usuaria autenticada puede crear una reserva de 14 días y ver el total correcto (días × precio + recambio).
- [ ] Las fechas ingresadas en Argentina (UTC-3) no se desfasan al guardar ni al mostrar.
- [ ] Registrar una seña actualiza el saldo pendiente y el estado en AlquileresView.
- [ ] El dashboard de Gastos muestra ingresos, gastos y balance filtrados por año/mes.
- [ ] Los datos persisten en Supabase y son accesibles desde celular y PC con la misma cuenta.
- [ ] La app es instalable como PWA en el home screen del celular *(pendiente — Unidad 15)*.
