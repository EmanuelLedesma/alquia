# Plan de Construcción (Build Plan)

## Reglas de Ejecución
- Cada unidad produce un resultado visible y verificable.
- Las dependencias se instalan justo a tiempo; no instalar nada que no sea requerido por la unidad actual.
- No avanzar a la siguiente unidad sin haber cumplido los criterios de verificación de la actual.

## Lista de Unidades en Orden de Construcción

### Fase 1: Esqueleto UI y Navegación (Mock Data)
**Unidad 1: Inicialización y App Shell**
- **Qué construye:** Creación del proyecto Vite+React, configuración de Tailwind CSS, instalación base de shadcn/ui y Lucide React. Creación del `Layout` principal con la barra de navegación inferior (Inmuebles, Clientes, Reservas, Gastos).
- **Dependencias requeridas previas:** Ninguna.

**Unidad 2: Vista de Inmuebles (UI Shell)**
- **Qué construye:** Pantalla de inicio mostrando dos tarjetas estáticas (Dúplex A y Dúplex B) con información hardcodeada (fotos de prueba, descripción, botón para copiar disponibilidad al portapapeles usando Clipboard API).
- **Dependencias requeridas previas:** Unidad 1 completa.

**Unidad 3: Vista de Clientes y Prospectos (UI Shell)**
- **Qué construye:** Lista simple con pestañas (Tabs) o un selector para cambiar entre "Prospectos" y "Clientes Activos". Datos mockeados. Tarjeta expansible para ver los detalles del grupo familiar.
- **Dependencias requeridas previas:** Unidad 1 completa.

### Fase 2: Formularios y Lógica de Negocio Financiera
**Unidad 4: Formulario de Nueva Reserva**
- **Qué construye:** Pantalla/Modal de alta de alquiler. Incluye selector de fechas (Date Picker), selección de cliente e inmueble, y la lógica de cálculo en tiempo real: (Días * Precio) + Pago Chica Recambio = Total.
- **Dependencias requeridas previas:** Unidades 1 y 2 completas.

**Unidad 5: Panel de Gestión Contable (Reserva Individual)**
- **Qué construye:** Vista de detalle de una reserva activa donde la usuaria puede registrar pagos de "señas". La UI debe recalcular dinámicamente el "Saldo Neto Pendiente" cada vez que se agrega una seña.
- **Dependencias requeridas previas:** Unidad 4 completa.

**Unidad 6: Vista de Gastos y Cierre Anual**
- **Qué construye:** Formulario simple para cargar un gasto a un dúplex. Vista de resumen (Dashboard) que cruza los ingresos totales vs gastos, mostrando el resultado final neto segmentado por año.
- **Dependencias requeridas previas:** Unidad 1 completa.

### Fase 3: Integración Backend y Persistencia
**Unidad 7: Integración con Supabase y Autenticación**
- **Qué construye:** Reemplazo de toda la información "hardcodeada" de las fases anteriores por llamadas a la base de datos real en Supabase. Implementación de login básico para proteger la app.
- **Dependencias requeridas previas:** Fase 1 y Fase 2 completas.
