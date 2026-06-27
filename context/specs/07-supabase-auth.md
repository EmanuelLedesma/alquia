# Unidad 7: Integración con Supabase y Autenticación Básica

## Objetivo
Configurar el cliente de Supabase en el proyecto, crear una pantalla de Login sencilla y proteger las rutas existentes para que solo un usuario autenticado pueda acceder a la aplicación. Aún no migraremos los datos de las vistas, solo la infraestructura de conexión y seguridad.

## Diseño
- **Pantalla de Login (`/login`):** Interfaz minimalista mobile-first.
- Debe contener un formulario simple con `Email`, `Contraseña` y un botón de "Ingresar" que ocupe todo el ancho (`w-full`) usando el color `primary`.
- Si el usuario no está autenticado e intenta entrar a `/`, debe ser redirigido automáticamente a `/login`.

## Implementación

### Configuración del Cliente
- Instalar el SDK oficial de Supabase.
- Crear el archivo `/src/services/supabase.js` que inicialice el cliente usando las variables de entorno `import.meta.env.VITE_SUPABASE_URL` y `import.meta.env.VITE_SUPABASE_ANON_KEY`.

### Autenticación y Enrutamiento Protegido
- Crear una función para manejar el inicio de sesión (`signInWithPassword`).
- Implementar un estado global o contexto de React simple (`AuthContext`) para mantener la sesión del usuario.
- Envolver las rutas actuales (`AppLayout` y sus vistas) en un componente `ProtectedRoute` que verifique la sesión. Si no hay sesión activa, redirigir a `/login`.
- Agregar un botón de "Cerrar Sesión" en alguna parte de la interfaz (puede ser en la barra superior del Layout o en una de las vistas como Gastos/Perfil).

## Dependencias
- `@supabase/supabase-js`

## Verificar cuando esté terminado
- [ ] La app exige iniciar sesión para ver las pantallas anteriores.
- [ ] La pantalla de login respeta los estilos base.
- [ ] El archivo `.env.local` está siendo leído correctamente por el cliente de Supabase.