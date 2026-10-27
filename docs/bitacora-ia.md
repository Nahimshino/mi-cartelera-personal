# Bitácora de uso de IA

| Fecha | Herramienta | Para qué se usó | Qué se revisó / adaptó |
|---|---|---|---|
| 2026-10-26 | Claude Code (Claude Opus 5.5) | Estructura del proyecto Expo con TypeScript, capa de servicios (Firebase, TMDB, caché), Context, pantallas, reglas de Firestore y README | Se revisó cada archivo; se comprobó con `tsc --noEmit`, pruebas en Expo Go y pruebas de reglas con dos cuentas |
| 2026-10-26 | Claude Code | Configuración de Firebase desde el CLI (proyecto, Auth con correo, Firestore, publicación de reglas) | Verificado en la consola de Firebase |

## Decisiones que debo poder explicar

- **Persistencia de sesión:** `initializeAuth` con `getReactNativePersistence(AsyncStorage)`; sin eso, la sesión se pierde al cerrar la app.
- **`itemId = tipo_tmdbId`:** TMDB numera por separado películas y series; el id compuesto evita choques y duplicados.
- **Modo sin conexión:** la lista se pide con `getDocsFromServer` y un tiempo límite; si falla se muestra la copia de AsyncStorage con un aviso. Las escrituras se aplican primero en local (optimistas); si se agota el tiempo quedan en la cola de Firestore y se avisa al usuario; si el servidor las rechaza se revierten.
- **Regla "solo se califica si está vista":** se aplica en la interfaz (estrellas deshabilitadas), en `normalizarCambios` y en `firestore.rules`.
- **Imágenes de TMDB:** URL = `base_url` + `file_size` + `file_path`, con `base_url` y tamaños de `/configuration` (w185 en listas, w500 en detalle).
