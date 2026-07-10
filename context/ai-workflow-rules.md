# Reglas de Flujo de Trabajo para la IA

1. **Desarrollo Orientado a Especificaciones:** Trabaja exclusivamente en la unidad solicitada. Lee `context/specs/NN-nombre.md` antes de escribir código. No realices cambios especulativos.
2. **Límites de Alcance:** Si el prompt pide UI, no implementes Supabase a menos que la spec lo indique. Si pide migración DB, no refactorices views.
3. **Requisitos Faltantes:** Si un requerimiento es ambiguo (especialmente dinero o fechas), DETENTE y pregunta. No inventes reglas de negocio.
4. **Sincronización:** Actualiza `context/progress-tracker.md` al iniciar (in progress) y al cerrar (complete) cada unidad.
5. **Context drift:** Si la implementación cambia arquitectura, alcance o estándares, actualiza el archivo de contexto correspondiente antes de continuar.

## Archivos que no modificar sin instrucción explícita
- `dist/` (output de build)
- `node_modules/`
- `.env.local` (credenciales)

## Convención de branches
- `feat/NN-nombre-corto` por unidad (ej. `feat/13-db-fixes`).

## Checklist de Verificación (antes de cerrar una unidad)
- [ ] `npm run build` pasa sin errores.
- [ ] Sin errores en consola del navegador en el flujo afectado.
- [ ] Diseño mobile-first cumple `ui-context.md`.
- [ ] Solo se tocó el alcance de la spec actual.
- [ ] `context/progress-tracker.md` actualizado.
