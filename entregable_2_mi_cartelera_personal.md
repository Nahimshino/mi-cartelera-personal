# Entregable 2 - Mi Cartelera Personal

## Parte 1 · Descripción del proyecto

### 1.1 Contexto y objetivo
**Mi Cartelera Personal** es una app móvil donde cada usuario busca películas y series en TMDB, las agrega a su lista personal y las organiza por estado (por ver, viendo, vista), con una calificación y un comentario propios. Es un proyecto de integración: reúne todo lo aprendido en la materia en una sola aplicación funcional.

**Objetivo:** construir y entregar una app móvil que combine autenticación con Firebase Auth, datos propios en Firestore y una API externa pública, escrita en TypeScript y ejecutable en un dispositivo con Expo.

---

### 1.2 Qué se evalúa (resultados de aprendizaje)
- **Integración full-stack móvil:** React Native + Firebase (Auth y Firestore) + API externa.
- **Navegación y estado:** React Navigation (pila y pestañas), Context API, persistencia local con AsyncStorage.
- **TypeScript aplicado:** interfaces, tipos unión, genéricos y estados de petición tipados.
- **Seguridad básica:** reglas de Firestore que aíslan los datos de cada usuario.
- **Calidad y proceso:** especificación previa, código organizado en capas, repositorio y demo.

---

### 1.3 Qué hace la aplicación
Un usuario se registra o inicia sesión, busca una película o serie por título, abre su ficha (póster, sinopsis, calificación de TMDB y elenco), la agrega a su lista y después cambia su estado, la califica y la comenta. Su lista es privada: nadie más puede verla ni modificarla.

---

### 1.4 Requisitos funcionales obligatorios

| # | Requisito | Criterio de aceptación |
|---|---|---|
| **RF1** | Registro, inicio y cierre de sesión con Firebase Auth | La sesión persiste al cerrar y reabrir la app; los errores de Firebase se muestran traducidos |
| **RF2** | Búsqueda de películas y series por título (TMDB) | Muestra carátula, título y año; maneja carga, error y sin resultados |
| **RF3** | Detalle de una obra | Muestra póster, sinopsis, calificación de TMDB y elenco; funciona si falta el póster o la sinopsis |
| **RF4** | Agregar a Mi lista | Crea el documento con estado inicial; no permite duplicados |
| **RF5** | Ver Mi lista por estado | Filtro por Por ver / Viendo / Vista y por tipo (película o serie) |
| **RF6** | Editar mi entrada | Cambiar estado, calificación (1 a 5) y comentario (hasta 500 caracteres); solo se califica si el estado es vista |
| **RF7** | Quitar de Mi lista | Pide confirmación antes de borrar |
| **RF8** | Persistencia y modo sin conexión | La lista se guarda en Firestore y existe una copia en AsyncStorage; con la app sin internet se muestra la última copia con aviso |
| **RF9** | Pantalla Acerca de / Créditos | Incluye la atribución y el logo de TMDB, y cierre de sesión |
| **RF10** | Código en TypeScript y por capas | Sin `any` innecesarios; servicios separados de las pantallas; claves fuera del repositorio |

---

### 1.5 Pantallas y navegación

| Pantalla | Contenido | Navegación |
|---|---|---|
| **Login / Registro** | Formulario con validación y alternancia entre ambos modos | Visible solo sin sesión |
| **Buscar** | Campo de búsqueda y resultados con carátulas | Pestaña inferior |
| **Detalle de TMDB** | Póster, sinopsis, calificación, elenco y botón Agregar a mi lista | Pantalla de la pila |
| **Mi lista** | Filtros por estado y tipo; tarjetas con calificación personal | Pestaña inferior |
| **Editar mi entrada** | Selector de estado, calificación, comentario y botón Quitar | Pantalla de la pila o modal |
| **Acerca de** | Atribución y logo de TMDB, datos de la app y cerrar sesión | Pestaña inferior |

---

### 1.6 Arquitectura y herramientas

| Capa | Herramienta | Responsabilidad |
|---|---|---|
| **Interfaz** | React Native + Expo (TypeScript) | Pantallas y componentes |
| **Navegación** | React Navigation (pila y pestañas) | Flujo entre pantallas; Login condicional según sesión |
| **Estado global** | Context API | Usuario, lista personal y acciones |
| **Servicios** | Carpeta `services/` | Único lugar donde se llama a Firebase y a TMDB |
| **Autenticación** | Firebase Auth | Cuentas de usuario |
| **Base de datos** | Firestore | Lista personal, aislada por usuario |
| **API externa** | TMDB | Catálogo de películas y series |
| **Caché local** | AsyncStorage | Copia de la lista para uso sin conexión |

**Estructura de carpetas sugerida:**
```text
src/
├── assets/
├── components/
├── context/
├── navigation/
├── screens/
├── services/
├── types/
└── utils/
```

---

### 1.7 Modelo de datos en Firestore
La tabla `mi_lista` del diseño original se implementa como una subcolección dentro de cada usuario. El `uid` del usuario forma parte de la ruta del documento, por lo que no hace falta un campo `usuario_id` y las reglas pueden aislar los datos.

| Campo | Tipo | Descripción |
|---|---|---|
| **tmdbId** | número | Identificador de la obra en TMDB |
| **tipo** | `'movie'` o `'tv'` | Película o serie |
| **titulo** | texto | Copiado de TMDB al agregar |
| **anio** | texto | Año de estreno o primera emisión |
| **posterPath** | texto o nulo | Solo la ruta de la imagen; la URL completa se arma al mostrarla |
| **estado** | `'por_ver'` \| `'viendo'` \| `'vista'` | Estado de visionado |
| **calificacionPersonal** | número o nulo | De 1 a 5; solo si el estado es vista |
| **comentario** | texto | Hasta 500 caracteres |
| **agregadoEn** / **actualizadoEn** | marca de tiempo | Hora del servidor (`serverTimestamp`) |

El `itemId` combina tipo y `tmdbId` (por ejemplo `movie_550` o `tv_1399`) porque TMDB maneja por separado los ids de películas y series. Además impide guardar la misma obra dos veces.

**Tipos de TypeScript mínimos que deben definir:**
```typescript
export type TipoObra = 'movie' | 'tv';
export type EstadoVisto = 'por_ver' | 'viendo' | 'vista';

export interface ElementoLista {
  id: string; // ej. "movie_550"
  tmdbId: number;
  tipo: TipoObra;
  titulo: string;
  anio: string;
  posterPath: string | null;
  estado: EstadoVisto;
  calificacionPersonal: number | null;
  comentario: string;
  agregadoEn?: any;
  actualizadoEn?: any;
}

export type EstadoPeticion<T> = 
  | { estado: 'cargando' }
  | { estado: 'exito'; datos: T }
  | { estado: 'error'; mensaje: string };
```

---

### 1.8 Integración con TMDB

| Tema | Qué deben saber e investigar |
|---|---|
| **Cuenta y clave** | Crear una cuenta en TMDB y solicitar acceso a la API. TMDB entrega un API Read Access Token (se envía como `Bearer` en el encabezado `Authorization`) y una clave `api_key`; el método por defecto es el token. La solicitud pide describir el proyecto; para uso no comercial basta una URL de desarrollo. |
| **URL base** | `https://api.themoviedb.org/3/` (versión 3 de la API). |
| **Endpoints a investigar** | Búsqueda de películas, de series (o búsqueda combinada) y detalle de película o serie. Deben averiguar cómo obtener el elenco junto con el detalle en una sola petición (parámetro `append_to_response`). |
| **Imágenes** | La API no devuelve una URL completa sino un `file_path`. La URL se arma con tres partes: `base_url`, `file_size` y `file_path`; las dos primeras vienen del endpoint `/configuration`. Usen un tamaño pequeño en listas y uno mayor en el detalle. |
| **Idioma** | Pueden solicitar los textos en español con el parámetro de idioma; algunas obras no tendrán sinopsis traducida, por lo que se necesita un texto alternativo. |
| **Paginación** | Las búsquedas devuelven resultados por páginas. |
| **Casos límite** | Obra sin póster, sin sinopsis, sin elenco, búsqueda sin resultados, error de red y límite de peticiones. |
| **Términos de uso** | Uso gratuito solo no comercial. Es obligatorio atribuir a TMDB y mostrar su logo y el aviso: *"This product uses the TMDB API but is not endorsed or certified by TMDB"*. El logo debe ser menos prominente que la marca de la propia app. Si la app se publicara y monetizara, dejaría de ser uso no comercial. |

> **Seguridad de la clave:** Un valor `EXPO_PUBLIC_` queda visible dentro del paquete de la app. Para este proyecto no comercial es aceptable, pero deben guardarlo en `.env` (fuera del repositorio) y poder explicar el riesgo. Quien implemente el proxy con Express en Render (ver 1.10) lo resuelve de raíz.

---

### 1.9 Seguridad: reglas de Firestore
Cada usuario solo puede leer y modificar su propia lista, y los datos deben cumplir las reglas de negocio también en el servidor. Reglas de partida (cada equipo debe adaptarlas, publicarlas y probarlas):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usuarios/{userId}/mi_lista/{documentId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

### 1.11 Restricciones y buenas prácticas
- El archivo `.env` no debe estar en el repositorio; incluyan un `.env.example` sin valores reales.
- Las pantallas no llaman directamente a Firebase ni a TMDB: usan la capa `services/`.
- Evitar `any`; si es indispensable, justificarlo con un comentario.
- Toda petición debe manejar los tres estados: cargando, error y éxito.
- Las acciones destructivas (quitar de la lista) piden confirmación.
- Los elementos tocables deben medir al menos 44 px de alto (principio de la Semana 6).
- Uso de IA permitido y fomentado, pero deben declararlo (ver bitácora de IA en la Parte 2) y entender y poder explicar todo el código entregado.

---

## Parte 2 · Guía paso a paso de lo que deben entregar

El proyecto se desarrolla en 3 pasos. En cada parte hay pasos concretos, un entregable y una forma de comprobar que el paso está terminado. No avancen al siguiente paso sin cumplir las verificaciones del anterior.

### Paso 1 — Base del proyecto

| Paso | Qué hacer | Entregable y cómo verificar |
|---|---|---|
| **0. Equipo y repositorio** | Crear el repositorio en GitHub con `.gitignore` (`node_modules`, `.env`, `.expo`, `dist`). Agregar al docente como colaborador si el repositorio es privado. | Repositorio creado con el primer commit. Verifiquen que `.env` no aparece en GitHub. |
| **1. Clave de TMDB** | Crear cuenta en TMDB, solicitar acceso a la API (uso no comercial) y copiar el API Read Access Token. Guardarlo en `.env` como `EXPO_PUBLIC_TMDB_TOKEN` y crear `.env.example`. | Probar el token fuera de la app (por ejemplo con `curl`) y obtener resultados de una búsqueda. |
| **2. README.md** | Antes de programar, escribir `README.md` con: objetivo, pantallas, descripción del proyecto, instrucciones de instalación (`npm install`, variables de entorno necesarias, `npm run dev`). | `README.md` en el repositorio. |
| **3. Proyecto Expo con TypeScript** | Crear el proyecto con la plantilla de TypeScript (`npx create-expo-app@latest --template blank-typescript`) usando la versión de Expo que indique el docente, e instalar las dependencias del curso. Crear la estructura de carpetas de la sección 1.6. | La app arranca en Expo Go sin errores y el compilador de TypeScript no reporta errores. |
| **4. Firebase Auth** | Crear un proyecto de Firebase nuevo (o reutilizar el del Proyecto 2), configurar Auth y migrar a TypeScript el login, registro, persistencia de sesión y navegación condicional. | **RF1 cumplido:** crear cuenta, cerrar sesión, iniciar sesión y reabrir la app conservando la sesión. Usuario visible en *Authentication → Users*. |

---

### Paso 2 — Catálogo con TMDB

| Paso | Qué hacer | Entregable y cómo verificar |
|---|---|---|
| **5. Tipos y servicio de TMDB** | Definir en `types/` las interfaces de las respuestas que usarán (resultado de búsqueda, detalle, elenco) y `EstadoPeticion<T>`. Crear `tmdbService.ts` con `buscar(titulo, pagina)`, `obtenerDetalle(tipo, id)` y una función que arme la URL de una imagen. | El servicio devuelve datos tipados. Probar con una búsqueda real e imprimir el primer resultado. |
| **6. Pantalla Buscar** | Campo de búsqueda y lista de resultados con carátula, título y año. Manejar cargando, error y sin resultados. Mostrar una imagen de relleno cuando no hay póster. | **RF2 cumplido.** Buscar un título que no existe y uno sin póster debe funcionar sin errores. |
| **7. Pantalla Detalle de TMDB** | Mostrar póster, sinopsis, calificación de TMDB y elenco. Texto alternativo si falta la sinopsis. | **RF3 cumplido** para una película y para una serie. |

---

### Paso 3 — Mi lista en Firestore

| Paso | Qué hacer | Entregable y cómo verificar |
|---|---|---|
| **8. Servicio de la lista** | Crear `listaService.ts` con agregar, obtener, actualizar y eliminar sobre `usuarios/{uid}/mi_lista`, usando el `itemId` `tipo_tmdbId` y `serverTimestamp`. | Probar cada función y comprobar los documentos en la consola de Firebase. |
| **9. Context y caché** | Crear `CarteleraContext` con la lista, el usuario y las acciones. Cada mutación debe escribir en Firestore, actualizar el estado local y guardar la caché en AsyncStorage. Usar un tiempo máximo en las escrituras para no quedar esperando sin conexión. | La lista cambia al instante y se conserva tras cerrar la app. Con el modo avión se ve la última copia con aviso (**RF8**). |
| **10. Pantallas de la lista** | Implementar Mi lista con filtros por estado y tipo, el botón Agregar en el detalle de TMDB y la pantalla Editar mi entrada con selector de estado, calificación y comentario. Aplicar la regla: solo se califica si el estado es vista. | **RF4, RF5, RF6 y RF7 cumplidos.** Intentar agregar dos veces la misma obra no la duplica. |
| **11. Reglas de seguridad** | Adaptar las reglas de 1.9, publicarlas y probarlas con el simulador y con dos cuentas distintas. | La cuenta B no puede leer ni modificar la lista de la cuenta A. Incluir la copia de `firestore.rules` en el repositorio. |

---

## Entregables finales

| Entregable | Formato | Contenido mínimo |
|---|---|---|
| **Repositorio de GitHub** | Enlace | Código, `README`, `.env.example`, `firestore.rules` y capturas; sin `.env` ni claves |
| **Capturas** | Imágenes en `docs/` | *Authentication → Users* y la subcolección `mi_lista` con al menos 3 documentos; el simulador de reglas denegando un acceso ajeno |
| **App en funcionamiento** | Demo en vivo | Expo Go en dispositivo físico o emulador |

**Vence el 27 de octubre de 2026 11:30**

---

## Rúbrica: Entregable 2 - Mi Cartelera Personal

| Criterios | Excelente | Satisfactorio | En desarrollo | Insuficiente | Puntuación |
|---|---|---|---|---|---|
| **Autenticación y sesión (15)** | **11.26–15.00 puntos**<br>registro, login y logout; sesión persistente; errores traducidos; navegación condicional correcta | **7.51–11.25 puntos**<br>funciona pero con detalles (errores sin traducir o validación incompleta) | **3.76–7.50 puntos**<br>solo login o sesión que no persiste | **0.00–3.75 puntos**<br>no funciona o es simulada | /15 |
| **Integración con TMDB (20)** | **16.00–20.00 puntos**<br>búsqueda y detalle completos (póster, sinopsis, calificación, elenco); carga, error y vacío; maneja póster o sinopsis ausentes; servicio tipado | **11.00–15.00 puntos**<br>funciona pero faltan estados o casos límite | **6.00–10.00 puntos**<br>solo búsqueda o detalle incompleto | **0.00–5.00 puntos**<br>no consume TMDB o usa datos fijos | /20 |
| **CRUD de Mi lista en Firestore (20)** | **16.00–20.00 puntos**<br>agregar, ver, editar y quitar; sin duplicados; regla de calificación solo en vista; confirmación al quitar; cambios visibles al instante | **11.00–15.00 puntos**<br>CRUD completo con fallas menores | **6.00–10.00 puntos**<br>falta alguna operación | **0.00–5.00 puntos**<br>no persiste en Firestore | /20 |
| **TypeScript (15)** | **11.26–15.00 puntos**<br>interfaces y tipo unión EstadoVisto; Record exhaustivo o switch con never; EstadoPeticion\<T\>; sin any injustificados | **7.51–11.25 puntos**<br>tipos correctos con algunos any o huecos | **3.76–7.50 puntos**<br>tipado parcial | **0.00–3.75 puntos**<br>casi sin tipos o con errores de compilación | /15 |
| **Seguridad y reglas (10)** | **7.60–10.00 puntos**<br>reglas publicadas, aislamiento entre usuarios probado con dos cuentas y validación de datos en el servidor | **5.10–7.50 puntos**<br>reglas por usuario sin validación de datos | **2.60–5.00 puntos**<br>reglas parcialmente correctas | **0.00–2.50 puntos**<br>reglas abiertas o no entregadas | /10 |
| **Atribución y términos de TMDB (5)** | **3.76–5.00 puntos**<br>logo y aviso exigidos visibles en Acerca de; logo menos prominente que la marca de la app; clave fuera del repositorio | **2.51–3.75 puntos**<br>atribución presente pero incompleta | **1.26–2.50 puntos**<br>solo menciona TMDB | **0.00–1.25 puntos**<br>sin atribución | /5 |
| **Calidad, documentación y demo (15)** | **11.26–15.00 puntos**<br>capas claras, README completo, demo fluida dentro del tiempo | **7.51–11.25 puntos**<br>documentación o demo incompletas | **3.76–7.50 puntos**<br>código desordenado o sin documentación | **0.00–3.75 puntos**<br>no entregado o no pudo demostrarse | /15 |
| **Total** | | | | | **/100** |