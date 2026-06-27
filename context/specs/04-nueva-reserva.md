# Unidad 4: Formulario de Nueva Reserva

## Objetivo
Construir la pantalla/formulario para dar de alta un nuevo alquiler (`/reservas`). Debe permitir seleccionar un cliente, un inmueble, las fechas de estadía, y calcular automáticamente el monto total en tiempo real. 

## Diseño
- El formulario debe ocupar toda la pantalla móvil, con un padding adecuado y elementos espaciados (`gap-4` o similar) para evitar toques accidentales.
- Los campos de entrada (inputs y selects) deben ser grandes (mínimo 44px de alto para accesibilidad móvil).
- El desglose del total (días, costo base, costo recambio, total final) debe mostrarse en una tarjeta (`Card`) destacada al final del formulario con color de fondo `secondary` o bordes `primary`.

## Implementación

### Datos de Prueba (Mock Data) para Selectores
- Proveer un array estático pequeño de Clientes (ej. "Juan Pérez", "Ana Gómez") y uno de Inmuebles ("Dúplex A", "Dúplex B") para popular los campos de selección `<select>`.
- Definir variables de estado iniciales para simular la configuración de temporada: `precioPorDia` (ej. $50000) y `costoRecambio` (ej. $15000).

### Formulario y Lógica de Cálculo
- Campos requeridos: 
  - Inmueble (Select).
  - Cliente (Select).
  - Fecha Desde (Input tipo Date).
  - Fecha Hasta (Input tipo Date).
  - Precio por Día (Input numérico, pre-cargado con la variable de estado pero editable).
  - Costo de Recambio (Input numérico, pre-cargado pero editable).
- Escribir una función pura de utilidad en `/src/lib/utils.js` (o en el mismo componente por ahora) que tome `fechaDesde` y `fechaHasta` y devuelva la cantidad de días de diferencia.
- El monto total se calcula dinámicamente como: `(días * precioPorDia) + costoRecambio`.

## Dependencias
- Ninguna nueva. Utilizar inputs nativos `<input type="date">` ya que los navegadores móviles (iOS/Android) abren selectores de fecha nativos excelentes y ahorramos instalar librerías pesadas.

## Verificar cuando esté terminado
- [ ] La vista muestra un formulario ordenado.
- [ ] Al cambiar la "Fecha Desde" y "Fecha Hasta", el sistema actualiza automáticamente la cantidad de días de alquiler.
- [ ] El desglose financiero muestra la matemática correcta: multiplicando días por precio diario y sumando el recambio.
- [ ] No hay errores de tipo "NaN" (Not a Number) en pantalla si las fechas están vacías; en su lugar, mostrar "$0" o un guion.