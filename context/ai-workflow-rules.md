# Reglas de Flujo de Trabajo para la IA

1. **Desarrollo Orientado a Especificaciones:** Trabaja exclusivamente en la unidad o característica solicitada en el prompt actual. No realices cambios especulativos ni agregues funcionalidades futuras.
2. **Límites de Alcance:** Si el prompt pide construir la interfaz de usuario (UI), no implementes conexiones a la base de datos (Supabase) a menos que se solicite explícitamente. Usa datos mockeados (falsos).
3. **Manejo de Requisitos Faltantes:** Si un requerimiento o regla de negocio es ambiguo, DETENTE y pregunta al usuario. No inventes reglas de negocio (especialmente en cálculos de dinero o fechas).
4. **Verificación:** Antes de dar por terminada una tarea, verifica que el código compila sin errores, que no hay errores en consola y que el diseño cumple con las reglas mobile-first establecidas en `ui-context.md`.
5. **Sincronización:** Recuerda siempre sugerir la actualización del `progress-tracker.md` al finalizar una unidad lógica.
