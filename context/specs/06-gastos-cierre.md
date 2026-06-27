# Unidad 6: Vista de Gastos y Cierre Anual

## Objetivo
Construir la pantalla de Gastos (`/gastos`), que contenga un formulario rápido para registrar un nuevo gasto asociado a un inmueble, y un panel de control (Dashboard) que muestre el balance anual (Ingresos Totales vs Gastos Totales = Resultado Final).

## Diseño
- Mantener la interfaz mobile-first.
- Dividir la pantalla en dos secciones principales (usando `Tabs` o simplemente apiladas verticalmente):
  1. **Cargar Gasto:** Formulario sencillo (Inmueble, Concepto, Monto, Fecha).
  2. **Balance Anual:** Tarjetas de métricas (Metric Cards) que muestren los números globales.
- Las tarjetas del balance deben ser visualmente claras: 
  - Ingresos en texto normal o verde.
  - Gastos en color `accent` (rojo/naranja) o texto secundario.
  - **Resultado Final** destacado en fuente grande.

## Implementación

### Datos de Prueba (Mock Data)
- Crear un array estático `gastosMock` con un par de gastos de prueba (ej. "Reparación termotanque - $40000").
- Simular variables de `ingresosTotalesMock` (la suma teórica de todos los alquileres de la temporada, ej. $2000000).

### Lógica del Balance
- El formulario de gastos debe agregar el nuevo gasto al array de estado `gastos`.
- El **Total de Gastos** se calcula sumando todos los montos del array `gastos`.
- El **Resultado Final** (Neto) se calcula como: `ingresosTotalesMock - Total de Gastos`.
- La interfaz del balance debe recalcular el "Resultado Final" automáticamente cada vez que se carga un gasto nuevo en el formulario.

## Dependencias
- Ninguna nueva.

## Verificar cuando esté terminado
- [ ] La vista permite cambiar entre cargar un gasto y ver el balance.
- [ ] El balance muestra correctamente los Ingresos, los Gastos y el Resultado Final.
- [ ] Al registrar un gasto nuevo (ej. $10,000), el "Total de Gastos" aumenta en $10,000 y el "Resultado Final" disminuye en $10,000 instantáneamente.