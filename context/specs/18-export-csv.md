# Unidad 18: Exportación CSV del Dashboard

## Goal
Botón "Exportar" en GastosView que descarga un CSV con las transacciones filtradas (ingresos + gastos) del período seleccionado.

## Design
- Botón secundario en header de GastosView, junto a filtros de período.
- Nombre archivo: `alquia-movimientos-YYYY-MM-DD.csv`
- Columnas: Fecha, Tipo, Concepto, Inmueble, Monto
- Encoding UTF-8 con BOM para Excel en español.

## Implementation

### 1. Función pura `exportToCsv(rows, filename)` en `utils.js`
- Generar blob y trigger download vía `<a download>`.

### 2. GastosView
- Mapear `transacciones` filtradas al formato CSV.
- Toast success al completar descarga.

## Dependencies
- Unidad 11 (dashboard financiero).
- Unidad 16 recomendada (toast de confirmación).

## Verify when done
- [ ] CSV descarga con filtros de año/mes activos.
- [ ] Excel/LibreOffice abre caracteres especiales correctamente.
- [ ] Montos de ingreso positivos, gastos negativos (o columna Tipo clara).
