# Arquitectura

## Stack Tecnológico
- Frontend: React con Vite.
- Estilos: Tailwind CSS.
- Componentes UI: shadcn/ui.
- Backend/Base de Datos: Supabase (PostgreSQL + Autenticación).
- Hosting: Netlify o Vercel.

## Modelo de Almacenamiento
- Todo el estado y los datos persistentes viven centralizados en Supabase.
- No se utiliza LocalStorage para el estado de la aplicación debido a la necesidad estricta de sincronización entre el celular y la PC de escritorio.

## Invariantes
- La aplicación es de uso privado; todas las rutas y mutaciones de datos requieren autenticación.
- Todo cálculo financiero (totales, saldos) debe realizarse de forma consistente y evitar errores de redondeo.
- No se deben instalar bibliotecas de terceros sin autorización explícita previa.
