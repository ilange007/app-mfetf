# Arquitectura — App MFETF ("Tu Familia es Mi Familia")

> **Documento vivo.** Describe el sistema **tal como está hoy**, no como nos gustaría que fuera.
> Donde una decisión nunca se tomó explícitamente, se dice. Donde algo está roto, se dice.
> Cada vez que cambies algo estructural, registra la desviación en [§14](#14-registro-de-decisiones-y-desviaciones).
>
> **Versión:** 1.0 · **Última revisión:** 2026-09-11 · **Rama de referencia:** `dev`
>
> Formato inspirado en una plantilla de arquitectura de referencia (ADRs cortos + invariantes +
> checklist). El contenido es propio de este proyecto.

---

## Tabla de contenidos

1. [Principio rector](#1-principio-rector)
2. [Qué es este sistema y para quién](#2-qué-es-este-sistema-y-para-quién)
3. [Estado real del código](#3-estado-real-del-código)
4. [Decisiones arquitectónicas (ADR)](#4-decisiones-arquitectónicas-adr)
5. [Mapa de componentes](#5-mapa-de-componentes)
6. [Modelo de datos en Firestore](#6-modelo-de-datos-en-firestore)
7. [Reglas de negocio del programa](#7-reglas-de-negocio-del-programa)
8. [Flujos principales](#8-flujos-principales)
9. [Frontend: convenciones y estado](#9-frontend-convenciones-y-estado)
10. [Seguridad](#10-seguridad)
11. [Configuración, entornos y despliegue](#11-configuración-entornos-y-despliegue)
12. [Costos y rendimiento](#12-costos-y-rendimiento)
13. [Orden de construcción propuesto](#13-orden-de-construcción-propuesto)
14. [Registro de decisiones y desviaciones](#14-registro-de-decisiones-y-desviaciones)
15. [Anti-patrones y checklist](#15-anti-patrones-y-checklist)
16. [Preguntas abiertas para el equipo](#16-preguntas-abiertas-para-el-equipo)

---

## 1. Principio rector

La aplicación es, en esencia, **cuatro tablas y un formulario**. Eso es el 10% del problema.

El 90% es el **dominio**: quién aporta, a quién beneficia, cuánto debe, desde qué mes, y quién
puede ver o tocar ese dato. Ahí hay dinero real de familias reales y un padrón de personas en
situación de vulnerabilidad.

**Diseña para el dominio y para la auditoría, no para la pantalla.**

Dos corolarios que este proyecto todavía no cumple y que deberían guiar cualquier reformulación:

1. **No hay servidor.** El navegador habla directo con Firestore. Por lo tanto **toda regla de
   negocio que importe tiene que poder expresarse en `firestore.rules`, o no está protegida.**
   Un `if` en un componente de Angular es una sugerencia de UX, no un control de acceso: cualquiera
   puede abrir la consola del navegador y saltárselo.
2. **El dinero es un registro contable, no un campo editable.** Un aporte que se puede sobrescribir
   sin dejar rastro no es un aporte, es una nota adhesiva.

---

## 2. Qué es este sistema y para quién

**Misión Gran Río (Bolivia)** opera un programa de apadrinamiento solidario llamado
*"Tu Familia es Mi Familia"* (TFEMF): una **familia aportante** cubre con una cuota mensual a una o
más **familias beneficiarias**, que reciben una **canasta** de alimentos en **entregas** periódicas.

La aplicación existe para responder, sin planillas sueltas:

- ¿Cuántas familias aportantes hay y cuántas están al día?
- ¿A qué familias beneficiarias cubre cada aportante?
- ¿Qué meses tiene cubiertos cada aportante y cuál es su saldo?
- (Pendiente) ¿Qué canastas hay que armar y a quién se entregaron?

**Usuarios:** personal y voluntariado administrativo de la Misión. Es una herramienta interna de
back-office, no un producto de cara al público. El volumen es pequeño (decenas a bajos cientos de
familias), y eso condiciona casi todas las decisiones técnicas: **la simplicidad vale más que la
escala.**

**Proyecto Firebase:** `tfemf-839ad` · **Repositorio:** `ilange007/app-mfetf`

---

## 3. Estado real del código

Esta tabla es lo primero que debería leer alguien que llega. Es deliberadamente honesta.

| Módulo | Ruta | Estado | Detalle |
|---|---|---|---|
| **Aportantes** | `/aportantes` | ✅ **Funciona** | El único módulo completo: alta, edición, registro de aportes, cálculo de saldo y estado, totales. Es la referencia de "cómo se hacen las cosas aquí". |
| **Familias** | `/familias`, `/familia/:id` | ✅ **Funciona** | Búsqueda, alta y renombrado. Se usa además como modal reutilizable desde Aportantes. |
| **Login** | `/login` | ✅ **Funciona** | Google Sign-In por popup. |
| Dashboard | `/` | ⚠️ **Maqueta** | Texto fijo ("80 Familias") + `iframe` de Google My Maps. Ningún dato viene de Firestore. |
| Entregas | `/entregas` | ⚠️ **Maqueta** | Tabla con 5 filas inventadas en el `.ts`. |
| Canasta | `/canasta` | ⚠️ **Maqueta** | Tabla con 3 filas inventadas y cifras fijas en el HTML. |
| Beneficiarios | `/beneficiarios` | 🧟 **Zombi** | El componente original está **comentado entero**; la clase activa al final del archivo es una copia de `FamiliasComponent`. No hace lo que su nombre promete. |
| Distritos | `/distritos` | ❌ **Roto** | Llama a `getRecords("")` — ruta de colección vacía. Fuera del menú. |
| Registro | `/registro` | ❌ **Roto** | También `getRecords("")`. Fuera del menú. |
| Personas | — | 🚧 **Huérfano** | Formulario completo (roles, salud, habilidades) pero **sin ruta**: no se puede llegar a él. |
| `add-aporte-dialog` | — | 🚧 **Vacío** | Componente generado y nunca escrito. |
| `firesvc.service.ts` | — | 💀 **Muerto** | Nadie lo importa. Usa `@angular/fire/compat` (`AngularFirestore`), que **no está provisto** en `app.config.ts`: si alguien lo inyectara, reventaría. Habla de `clinicas`, `pacientes` y `solicitudes` — es herencia de otro proyecto. |
| `models/{clinica,paciente,solicitud,responsable}.ts` | — | 💀 **Muerto** | Mismo origen. `responsable.ts` es una clase vacía. |
| `app-routing.module.ts` | — | 💀 **Muerto** | `NgModule` de rutas que nadie importa; la app usa `app.routes.ts`. |

**Sin pruebas.** Todos los `.spec.ts` son los andamios que genera el CLI (`should create`). `ng test`
no protege nada.

**Dependencias instaladas y no usadas:** `@angular/material` y `@angular/cdk` (v17, contra Angular
18), y `provideDatabase` (Realtime Database) sin una sola lectura o escritura en el código.

---

## 4. Decisiones arquitectónicas (ADR)

Formato corto: **decisión → razón → alternativa rechazada**, más un campo **estado**:

- **Vigente (explícita)** — se decidió a propósito y el código la respeta.
- **Vigente (implícita)** — el código la aplica, pero nadie la discutió; vale la pena ratificarla o tumbarla.
- **Propuesta** — todavía no está implementada. Se anota aquí para que la discusión exista.

---

### ADR-01 · Aplicación SPA sin backend propio (BaaS)

**Estado:** vigente (implícita).

**Decisión.** Angular 18 (componentes *standalone*) servido como estático desde Firebase Hosting,
hablando directamente con Firebase Auth y Cloud Firestore desde el navegador. No hay servidor
propio, ni Cloud Functions, ni API intermedia.

**Razón.** Es una ONG con volumen pequeño y sin equipo de operaciones. El *free tier* de Firebase
cubre holgadamente este uso, no hay nada que parchear ni monitorear, y el despliegue es un `push`.

**Consecuencia que no se negocia.** Sin backend, **`firestore.rules` es el backend**. Todo lo que
no esté en las reglas, no está protegido (ver [ADR-02](#adr-02--firestore-es-la-única-fuente-de-verdad-y-las-reglas-son-el-backend) y [§10](#10-seguridad)).

**Rechazado.** Un backend propio (Node/Express, Cloud Run). Costo operativo y de mantenimiento que
este proyecto no puede sostener con voluntariado intermitente.

**A revisar si:** aparece lógica que el cliente no puede hacer con seguridad — envío de correos o
WhatsApp, reportes agregados, integración con un banco, importación masiva. Entonces la pieza
correcta es **una Cloud Function puntual**, no un backend completo.

---

### ADR-02 · Firestore es la única fuente de verdad, y las reglas son el backend

**Estado:** vigente en la primera mitad, **incumplida en la segunda**.

**Decisión.** Todo el estado persistente vive en Cloud Firestore. No hay caché propia, ni store
(NgRx/Signals store), ni copia local: los componentes se suscriben a `collectionData`/`docData` y
pintan lo que llega.

**Razón.** Los listeners en tiempo real resuelven gratis la sincronización entre pestañas y
usuarios, el modo offline del SDK y la reconexión. Para un CRUD de este tamaño, cualquier capa de
estado por encima sería ceremonia sin beneficio.

**El incumplimiento.** `firestore.rules` está hoy en:

```
match /{document=**} {
  allow read, write;
}
```

Es decir: **cualquier persona en internet puede leer, modificar y borrar toda la base**, sin
autenticarse. El `projectId` está en el bundle público, así que no hace falta ni acceso al
repositorio. Esto convierte el invariante de esta ADR en una aspiración. **Es la deuda número uno
del proyecto** ([§10.1](#101-el-agujero-abierto)).

**Rechazado.** Guardar estado de negocio en el cliente (localStorage, servicios con estado mutable)
como fuente de verdad. `LoginsvcService` ya guarda `usr` y `distritoId` en memoria; eso es caché de
sesión, no fuente de verdad, y debe seguir siéndolo.

---

### ADR-03 · Identidad con Google; la autorización vive en Firestore

**Estado:** vigente (explícita).

**Decisión.** El *quién eres* lo resuelve Firebase Auth con Google Sign-In (`signInWithPopup`). El
*qué puedes hacer* se lee de `Usuarios/{uid}`, un documento con `personaId` y `roles[]`, donde cada
rol es `{ nombreRol, idDistrito }`.

**Razón.** El personal de la Misión ya tiene cuenta de Google. No hay que gestionar contraseñas,
recuperación ni verificación de correo.

**Consecuencia operativa importante.** **Autenticarse no alcanza.** Si no existe
`Usuarios/{uid}`, `detectarCredenciales()` redirige a `/login` en bucle. Dar de alta a una persona
voluntaria es **crear ese documento a mano** en la consola de Firebase. Está documentado en el
[README](../README.md#3-darte-de-alta-como-usuario); no es obvio y ha costado tiempo a quien llega.

**Limitación conocida.** El código toma `roles[0]` y comenta *"Hacer código para el caso de que haya
más de un rol"*. Multi-rol y multi-distrito por persona **no están resueltos**.

**Rechazado.** Custom claims en el token de Auth (más correcto para reglas, pero exige una Cloud
Function para asignarlos — choca con ADR-01). Es la alternativa natural si algún día las reglas
necesitan el rol sin pagar una lectura extra.

---

### ADR-04 · Los datos operativos cuelgan del distrito; el padrón de familias es global

**Estado:** vigente (implícita) e **inconsistente**.

**Decisión de hecho.** Conviven dos criterios:

```
Distritos/{distritoId}/Aportantes/{id}     ← por distrito
Distritos/{distritoId}/Personas/{id}       ← por distrito
Familias/{id}                              ← GLOBAL, en la raíz
Usuarios/{uid}                             ← GLOBAL, en la raíz
```

**Razón (reconstruida).** La Misión opera por distritos y se quiso aislar la operación de cada uno.
`Familias` quedó fuera probablemente porque una familia podría ser aportante en un distrito y
beneficiaria en otro — pero eso nunca se escribió.

**Por qué importa.** Las reglas de seguridad por distrito son triviales para lo que cuelga de
`Distritos/{id}` y difíciles para `Familias`. Hoy no hay reglas, así que no duele; en cuanto se
escriban, esta inconsistencia es lo primero que va a estorbar.

**Decisión pendiente.** O `Familias` se mueve bajo el distrito, o se documenta explícitamente que el
padrón es compartido y se diseñan sus reglas aparte. **No dejarlo a medias.**
Ver [§16](#16-preguntas-abiertas-para-el-equipo).

---

### ADR-05 · Un aporte es un elemento de un array dentro del documento del aportante

**Estado:** vigente (implícita). **Candidata número uno a ser revertida.**

**Decisión de hecho.** `Distritos/{d}/Aportantes/{id}` tiene un campo `aportes[]`; cada pago nuevo se
**inserta en la posición 0** (`aportes.insert(0, ...)`), de modo que `aportes[0]` es siempre el más
reciente. Igual con `beneficiarios[]`, que guarda IDs de `Familias`.

**Razón (reconstruida).** Se escribe y se lee todo de una sola vez: una lectura trae al aportante con
todo su historial, y guardar es un único `updateDoc` atómico. Para un puñado de aportes al año por
familia, cabe de sobra.

**Lo que cuesta:**

| Problema | Consecuencia |
|---|---|
| Límite de 1 MiB por documento | Techo lejano, pero **existe** y no avisa hasta que rompe. |
| No se puede consultar | *"Todos los aportes de marzo"* o *"total recaudado del año"* es imposible por query: hay que bajar **todos** los aportantes y sumar en el cliente. |
| Sin auditoría | Un `updateDoc` reescribe el array entero. Quién cambió qué y cuándo se pierde. El `descripcion` del aporte incluye el correo del usuario — es una bitácora **dentro de un string**, no un dato consultable. |
| Concurrencia | Dos personas editando el mismo aportante: la última escritura gana y borra la otra, en silencio. |

**Alternativa (propuesta, no implementada).** Subcolección
`Distritos/{d}/Aportantes/{id}/aportes/{aporteId}`, con documentos inmutables
(`{ monto, mesCubierto, fechaDeposito, beneficiariosCubiertos, registradoPor, registradoEn }`) y el
saldo como campo derivado en el documento padre. Permite consultar, no se puede reescribir la
historia, y elimina la carrera de concurrencia.

**Si alguien reformula el proyecto, esta es la primera decisión que debería revisar.**

---

### ADR-06 · El saldo se calcula al vuelo a partir del último aporte

**Estado:** vigente (implícita), **híbrida y frágil**.

**Decisión de hecho.** Al pintar la tabla de aportantes:

```ts
saldo = saldoGuardadoEnAportes[0] − mesesTranscurridos × costoAporte × numBeneficiarios
estado = saldo >= 0 ? 'Activo' : 'Debe'
```

donde `mesesTranscurridos` es la diferencia en meses entre `aportes[0].mesCubierto` y **hoy**.

**Razón.** El saldo envejece solo: no hace falta un proceso nocturno que recalcule deudas.

**El problema.** Es **híbrido**: el saldo se *almacena* dentro del aporte y además se *recalcula* al
leer. Dos fuentes para el mismo número. Si `costoAporte` (hoy `150`, **fijo en el código**) cambia
alguna vez, todo el histórico se reinterpreta con el precio nuevo y los saldos pasados mienten.
Y si cambia el número de beneficiarios de una familia, el recálculo aplica el número **actual** a
meses pasados en los que era otro.

**Propuesta.** Congelar en cada aporte los parámetros con los que se cobró
(`costoAporteAplicado`, `beneficiariosCubiertos`) y mover `costoAporte` a un documento de
configuración con vigencia por fecha. Ver [§7](#7-reglas-de-negocio-del-programa).

---

### ADR-07 · El control de acceso vive en `ngOnInit`

**Estado:** vigente (implícita). **Anti-patrón reconocido.**

**Decisión de hecho.** Cada componente protegido comprueba el rol en su propio `ngOnInit` y navega
a `/login` si no le gusta lo que ve:

```ts
if (this.loginSvc.usr.roles[0]?.nombreRol != "SuperAdmin") this.router.navigate(['/login']);
```

**Por qué está mal, en dos niveles.**

1. **Como UX:** se ejecuta *después* de instanciar el componente, hay condición de carrera con la
   carga asíncrona del usuario, y está copiado y pegado en cada componente. Lo correcto es un
   `CanActivateFn` en `app.routes.ts`, en un solo lugar.
2. **Como seguridad:** **no es seguridad en absoluto.** Es código en el navegador del propio usuario.
   La única barrera real son las reglas de Firestore ([ADR-02](#adr-02--firestore-es-la-única-fuente-de-verdad-y-las-reglas-son-el-backend)).

**Propuesta.** Un guard de rutas para la experiencia, y reglas de Firestore para la seguridad. Las
dos cosas, no una.

---

### ADR-08 · Despliegue estático continuo desde GitHub

**Estado:** vigente (explícita), **con la configuración rota**.

**Decisión.** Firebase Hosting sirve `dist/app-mfetf/browser` con *rewrite* de `**` a `/index.html`
(SPA). Dos workflows generados por la CLI de Firebase despliegan a `live` (merge) y a canal de
vista previa (pull request).

**Lo que está roto hoy** (ver [§11.3](#113-lo-que-está-roto-en-ci)):

- Los workflows disparan en la rama `main`, pero el trabajo va en **`dev`**.
- Ejecutan `ng build` **sin `npm ci` y sin `actions/setup-node`**: `ng` no existe en el runner.
- Nunca ejecutan `ng test` ni ningún *lint*.
- El build necesita `src/environments/environment.ts`, que está en `.gitignore`: **aunque se
  arreglara lo anterior, seguiría fallando** hasta resolver la configuración ([§11.1](#111-el-archivo-que-falta)).

En la práctica: **el despliegue es manual** (`ng build && firebase deploy`).

---

### ADR-09 · Bootstrap y los iconos por CDN, sin framework de componentes

**Estado:** vigente (implícita), **con residuos peligrosos**.

**Decisión de hecho.** `src/index.html` carga por CDN Bootstrap 5.3 (CSS), Bootstrap Icons y
`src/styles.css` con estilos globales propios. Los componentes usan clases de Bootstrap
directamente en las plantillas.

**Razón.** Rápido, sin build de estilos, familiar para cualquiera que llegue.

**Los residuos.** `index.html` también carga **jQuery 3.7** y **Bootstrap 3.4 (JS)** — dos versiones
mayores por detrás del CSS — y trae un bloque de scripts que **manipula el DOM a mano**: filtrado de
tablas por `keyup` sobre `#myInput` y edición de filas *in situ* con `$fila.find("td:eq(0)").html(...)`.

Eso **pelea con Angular por el control del DOM**. Angular ya hace ese filtrado (`filteredData`) y ya
gestiona esos formularios. Los scripts apuntan a IDs que existen en las plantillas actuales
(`#myInput`, `#toggleFormBtn`), así que no son inofensivos: es una fuente real de comportamiento
fantasma.

**Acción propuesta.** Borrar jQuery, Bootstrap 3 y todo el `<script>` de `index.html`. Decidir
después, con calma, si se adopta Angular Material (ya está en `package.json`, sin usar y con versión
desalineada) o se sigue con Bootstrap a secas. **Las dos cosas a la vez, no.**

---

## 5. Mapa de componentes

```
┌───────────────────────────────────────────────────────────────┐
│  Navegador — Angular 18 SPA (componentes standalone)          │
│                                                               │
│   AppComponent                                                │
│     ├── MenuComponent  (navegación + redes sociales)          │
│     └── <router-outlet>                                       │
│           ├── DashboardComponent   (maqueta + iframe de mapa) │
│           ├── AportantesComponent  ◄── el módulo real         │
│           │      └── FamiliasComponent (como modal de búsqueda)│
│           ├── FamiliasComponent / FamiliaComponent            │
│           ├── LoginComponent                                  │
│           └── Entregas · Canasta · Distritos · Beneficiarios  │
│                                                               │
│   Servicios (providedIn: 'root')                              │
│     ├── LoginsvcService    → sesión, rol, distritoId activo   │
│     └── FirestoreService   → CRUD genérico por ruta           │
└──────────┬─────────────────────────────────┬──────────────────┘
           │ SDK Firebase (directo)          │ listeners en tiempo real
           ▼                                 ▼
┌────────────────────┐            ┌──────────────────────────────┐
│  Firebase Auth     │            │  Cloud Firestore             │
│  · Google Sign-In  │            │  · Familias/                 │
└────────────────────┘            │  · Usuarios/                 │
                                  │  · Distritos/{d}/Aportantes/ │
┌────────────────────┐            │  · Distritos/{d}/Personas/   │
│  Firebase Hosting  │            │                              │
│  · estático + SPA  │            │  ⚠ firestore.rules ABIERTAS  │
└────────────────────┘            └──────────────────────────────┘
```

**Regla de oro del diagrama:** no hay ninguna caja entre el navegador y la base de datos. Todo lo
que el navegador puede pedir, lo obtiene — salvo que las reglas digan que no.

**`FirestoreService` es deliberadamente tonto:** `createRecord`, `getRecords`, `getRecordById`,
`updateRecord`, `deleteRecord`, todos parametrizados por una ruta de colección en texto. No sabe nada
del dominio. Esa decisión está bien para un CRUD, pero significa que **toda la lógica de negocio vive
en los componentes** — y por eso `AportantesComponent` pasa de 300 líneas. Extraer un
`AportantesService` con el dominio (saldo, estado, meses cubiertos) y sus pruebas unitarias es una
mejora de alto valor y bajo riesgo: es la manera de tener tests sin montar Angular entero.

---

## 6. Modelo de datos en Firestore

### 6.1 Límites que condicionan el diseño

| Límite | Valor | Implicación aquí |
|---|---|---|
| Tamaño máximo de documento | 1 MiB | Techo del array `aportes[]` de [ADR-05](#adr-05--un-aporte-es-un-elemento-de-un-array-dentro-del-documento-del-aportante). Lejano, pero real. |
| Escrituras sostenidas por documento | ~1/seg | Irrelevante al volumen actual. |
| Consultas de subcadena (`LIKE`) | **No existen** | Por eso la búsqueda de familias baja la colección entera y filtra en el cliente ([§12.2](#122-la-búsqueda-de-familias-baja-todo)). |
| Filtro de desigualdad por consulta | 1 campo | A tener en cuenta cuando se añadan filtros a las tablas. |
| Costo | Por documento leído/escrito | La clave de [§12](#12-costos-y-rendimiento). Leer 500 familias en cada tecla son 500 lecturas. |

### 6.2 Estructura actual

Reconstruida leyendo el código: **no hay esquema declarado en ninguna parte**, y las clases de
`src/app/models/` **no se corresponden con lo que se escribe**.

```
Usuarios/{uid}
  personaId : string          ← referencia a Personas (hoy no se usa para nada)
  roles     : [ { nombreRol: "SuperAdmin" | …, idDistrito: string } ]
  ← lo leen LoginsvcService.detectarCredenciales(); NO lo crea la app: se crea a mano

Familias/{familiaId}
  nombre : string             ← siempre en MAYÚSCULAS (se fuerza al guardar)
  ← colección GLOBAL, ver ADR-04. El modelo Familia declara direccion, ubicacion
    y miembros[], pero la app nunca los escribe.

Distritos/{distritoId}
  ← el documento de distrito en sí apenas se usa; importa como contenedor

Distritos/{distritoId}/Aportantes/{aporteId}
  idFamilia     : string        ← ref a Familias/{id}: quién aporta
  estado        : "Activo"      ← escrito literal al crear; el estado mostrado se
                                  RECALCULA al leer y puede no coincidir con este campo
  beneficiarios : string[]      ← IDs de Familias/{id} cubiertas
  aportes       : Aporte[]      ← más reciente PRIMERO (índice 0)

Distritos/{distritoId}/Personas/{personaId}
  ← lo escribe PersonasComponent, que no tiene ruta: en la práctica está vacía
  nombre, paterno, materno, fechaNac, sexo, telefono, direccion, correo,
  familiaId, activo, roles[], estadosSalud[], habilidades[]
```

**Forma de un `Aporte`** (tal y como lo construye `AportantesComponent.addAporte()`):

```jsonc
{
  "id": 3,                      // índice en el momento de crearlo; NO es estable ni único
  "mesCubierto": "2025-04",     // "YYYY-M" — ojo: sin cero a la izquierda
  "saldo": 150,                 // saldo resultante tras este pago
  "fechaDepo": "2025-4-2",      // "YYYY-M-D" — tampoco normalizado
  "descripcion": "600 | 2025-04 | NumBen: 4 | Saldo: 0 | Juan | 2025-4-2 | Usr: alguien@…"
}
```

> **`descripcion` es la bitácora del proyecto y está dentro de un string.** Es lo que el equipo lee
> para saber qué pasó. Cualquier reformulación debería convertir esos campos en campos de verdad y
> dejar `descripcion` como texto libre opcional.

**Fechas como texto, sin normalizar.** `"2025-4-2"` no ordena lexicográficamente igual que
`"2025-04-02"`. Hoy no muerde porque el orden lo da la posición en el array, pero cualquier
`orderBy` sobre estos campos dará resultados incorrectos. **Normalizar a ISO
(`YYYY-MM-DD`) o migrar a `Timestamp` es prerrequisito** de casi cualquier funcionalidad nueva.

### 6.3 Índices

`firestore.indexes.json` está vacío. Es coherente: hoy no hay ninguna consulta compuesta. En cuanto
aparezca un `where` + `orderBy`, Firestore fallará con un error que **incluye el enlace para crear el
índice**; hay que añadirlo a ese archivo y no solo pulsarlo en la consola, o se pierde al
redesplegar.

### 6.4 Lo que no existe y probablemente debería

- **Entregas** y **Canastas** — hoy son maquetas con datos inventados.
- **Configuración del programa** — `costoAporte = 150` está incrustado en el código
  ([ADR-06](#adr-06--el-saldo-se-calcula-al-vuelo-a-partir-del-último-aporte)).
- **Bitácora de auditoría** — quién hizo qué y cuándo.

---

## 7. Reglas de negocio del programa

Extraídas del código. **Ninguna de ellas está escrita en otro lado, y varias merecen que el equipo
las confirme.**

| Regla | Implementación | Estado |
|---|---|---|
| La cuota es **150 Bs por familia beneficiaria y por mes** | `costoAporte = 150` en `AportantesComponent` | ⚠️ Fija en el código. Cambiarla reinterpreta todo el histórico. |
| El monto sugerido es `150 × nº de beneficiarias` | Se autocompleta al añadir o quitar beneficiaria | ✅ |
| Un aporte cubre **desde un mes de inicio** | `mesInicio`; si se omite, el mes siguiente al último cubierto | ✅ |
| El **saldo** decrece un mes de cuota por cada mes transcurrido | `obtenerSaldo()` | ⚠️ Usa el nº de beneficiarias **actual** para meses pasados. |
| Estado **"Activo"** si `saldo ≥ 0`, **"Debe"** si no | `obtenerEstado()` | ⚠️ El campo `estado` de Firestore solo se escribe al crear o editar y envejece: al pasar los meses contradice al estado mostrado. |
| Los nombres de familia se guardan en **MAYÚSCULAS** | `.toUpperCase()` al guardar | ✅ Convención tácita; respétala. |
| Solo **SuperAdmin** entra a Familias | Comprobación en `ngOnInit` | ⚠️ Solo cosmético ([ADR-07](#adr-07--el-control-de-acceso-vive-en-ngoninit)). |
| Los totales de la cabecera | `totalAportantes`, `totalDeudores`, `totalBeneficiarias` | ⚠️ `totalSaldos` se calcula pero está **comentado en la plantilla**: nadie lo ve. |

> **Un aporte cubre exactamente un mes, siempre.** El código lo dice en un comentario:
> *"Cambiar por una función que cubra el rango de meses"*. Si alguien paga seis meses de golpe, el
> monto se registra pero **el mes cubierto avanza uno solo**, y esa familia aparecerá como deudora
> al mes siguiente aunque tenga saldo a favor. Confirmar con la Misión cómo debe comportarse es una
> de las [preguntas abiertas](#16-preguntas-abiertas-para-el-equipo).

---

## 8. Flujos principales

### 8.1 Inicio de sesión

```
1. AppComponent llama a loginSvc.detectarCredenciales() al arrancar
2. Se suscribe a user(auth)
3. ¿Sin usuario de Google?          → /login
4. ¿Con usuario? → lee Usuarios/{uid}
     ¿No existe el documento?       → /login   ← el bucle que sufre quien llega nuevo
     ¿Existe? → guarda uid, roles y distritoId = roles[0].idDistrito en memoria
```

**Fragilidad:** `detectarCredenciales()` se llama desde `AppComponent` **y otra vez** desde
`AportantesComponent`, abriendo suscripciones duplicadas que nunca se cierran.

### 8.2 Alta / edición de un aportante

```
1. Botón "+" → toggleForm()
2. Clic en "Flia Aportante"  → abre FamiliasComponent como modal → onFamiliaSelected()
3. "+" en beneficiarias      → mismo modal → push al FormArray, recalcula el monto
4. Monto / depositante / mes / fecha → addAporte() inserta el aporte en la posición 0
5. onSubmit() → ¿hay selectedIdAportante? onUpdate() : onCreate()
6. limpiarCamposDocumento() borra los campos auxiliares del formulario
   (nombreFam, monto, mesInicio, fechaDepo, depositante) para que no se persistan:
   el aporte ya los lleva dentro.
```

### 8.3 Pintado de la tabla de aportantes (y sus dos problemas)

```
getRecords("Distritos/{d}/Aportantes")
  └─ por cada aportante → getRecordById("Familias", idFamilia)   ← una lectura EXTRA por fila
       └─ al llegar: this.data[this.cont++].Aportante = familia.nombre
```

1. **N+1 lecturas.** Con 200 aportantes son 201 lecturas para pintar una tabla — y son *listeners*
   permanentes, no lecturas de una vez.
2. **Condición de carrera.** El contador `cont` avanza en el **orden en que responde la red**, no en
   el de las filas. Si una respuesta llega desordenada, **el nombre de una familia aparece en la fila
   de otra**. Es un error de *datos visibles*, no de estilo.

**Arreglo propuesto:** desnormalizar `nombreFamilia` en el documento del aportante (es texto que
cambia muy rara vez), o resolver los nombres con `forkJoin` respetando el índice de cada fila.

---

## 9. Frontend: convenciones y estado

- **Angular 18, componentes `standalone`.** No hay `NgModule` (salvo el muerto
  `app-routing.module.ts`). Cualquier componente nuevo: `standalone: true` e imports explícitos.
- **Formularios reactivos** (`FormGroup` / `FormArray`) en lo nuevo; queda algún `ngModel` suelto en
  las maquetas.
- **Sin gestión de estado.** Los componentes se suscriben directo a Firestore. Es adecuado a este
  tamaño; no introduzcas NgRx sin una razón concreta.
- **Estilos:** `src/styles.css` global (variables OKLCH heredadas de la plantilla de Angular) +
  clases de Bootstrap en las plantillas. Los `.css` por componente están casi vacíos.
- **Idioma:** todo el código, los comentarios y la interfaz están **en español**. Mantenlo.
- **Convención de nombres:** `Familias`, `Usuarios`, `Distritos`, `Aportantes` van en **plural y con
  mayúscula inicial** en Firestore. Los campos van en `camelCase`.

**Deuda transversal: nadie se da de baja de nada.** No hay un solo `unsubscribe`, `takeUntilDestroyed`
ni `async` pipe en el código. Cada `subscribe` a `collectionData` deja un listener vivo que sigue
recibiendo (y **cobrando**) después de destruir el componente. `FamiliasComponent.search()` abre uno
**por cada tecla pulsada**. Arreglar esto es barato y mejora costo, memoria y comportamiento.

---

## 10. Seguridad

### 10.1 El agujero abierto

```rules
match /{document=**} {
  allow read, write;
}
```

**Cualquiera en internet puede leer, escribir y borrar la base completa.** No hace falta cuenta, ni
invitación, ni el repositorio: el `projectId` (`tfemf-839ad`) viaja en el JavaScript público de la
app, y con eso basta para hablar con la API de Firestore.

Y lo que hay dentro **no es trivial**: nombres y direcciones de familias en situación de
vulnerabilidad, correos, y el modelo `Persona` prevé **estados de salud** — datos sensibles.

> **Para quien llegue de voluntario: esto es lo primero que hay que arreglar.** No es una tarea
> "cuando haya tiempo". Cerrar las reglas no requiere tocar el resto de la aplicación.

**Forma mínima de unas reglas correctas** (esbozo, hay que probarlo con el emulador):

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function estaAutenticado() { return request.auth != null; }

    function rolesDelUsuario() {
      return get(/databases/$(database)/documents/Usuarios/$(request.auth.uid)).data.roles;
    }

    // Cada quien lee su propio documento de usuario; nadie lo escribe desde la app.
    match /Usuarios/{uid} {
      allow read:  if estaAutenticado() && request.auth.uid == uid;
      allow write: if false;                 // alta manual desde la consola (ADR-03)
    }

    // Padrón global: lectura para personal autenticado, escritura acotada.
    match /Familias/{familiaId} {
      allow read:   if estaAutenticado();
      allow create, update: if estaAutenticado();   // ← endurecer por rol
      allow delete: if false;
    }

    match /Distritos/{distritoId} {
      allow read: if estaAutenticado();

      match /{coleccion}/{docId} {
        allow read, write: if estaAutenticado()
          && rolesDelUsuario().hasAny([{ 'nombreRol': 'SuperAdmin', 'idDistrito': distritoId }]);
      }
    }
  }
}
```

**Antes de desplegar cualquier regla:** probarla con el emulador (`firebase emulators:start`) y con
casos negativos explícitos (*este usuario NO debe poder leer esto*). Unas reglas mal puestas dejan la
app inservible en producción en el mismo segundo.

### 10.2 Otros puntos

| Asunto | Estado | Nota |
|---|---|---|
| Correo y UID de admin en el código | ⚠️ | `firesvc.service.ts` lleva incrustados el UID, el correo y la foto de una persona real. Ese archivo está muerto: **bórralo**. |
| `idDistrito` por defecto en el código | ⚠️ | `models/usuario.ts` trae un ID de distrito real como valor por defecto. |
| Configuración de Firebase fuera del repo | ℹ️ | `src/environments` está en `.gitignore`. Conviene saber que **la config web de Firebase no es un secreto** (viaja en el bundle); lo que protege los datos son las reglas. Mantenerla fuera del repo está bien, pero no sustituye a [§10.1](#101-el-agujero-abierto). |
| Datos sensibles | ⚠️ | El modelo `Persona` prevé `estadosSalud[]`. Antes de empezar a guardarlos, decidir quién puede verlos y por cuánto tiempo se conservan. |
| Dependencias | ℹ️ | `firebase-tools` está en `dependencies` (no en `devDependencies`): infla la instalación y el análisis de vulnerabilidades sin necesidad. |

---

## 11. Configuración, entornos y despliegue

### 11.1 El archivo que falta

`src/app/app.config.ts` importa `../environments/environment`, y `.gitignore` excluye
`/src/environments`. **Una clonación limpia del repositorio no compila.** Es el primer muro con el
que choca quien llega, y el [README](../README.md#2-configurar-firebase) explica cómo crear el
archivo.

Alternativa a discutir: versionar `src/environments/environment.example.ts` con la forma del objeto
(y valores vacíos), para que el fallo sea evidente en vez de misterioso.

### 11.2 Despliegue manual (el que funciona hoy)

```bash
ng build                       # genera dist/app-mfetf/browser
firebase deploy --only hosting # o: --only firestore:rules
```

`firebase.json` publica `dist/app-mfetf/browser` con *rewrite* de `**` → `/index.html`.

`public/index.html` es la página de bienvenida de Firebase que quedó de la inicialización; **no se
publica** (`public/` es la carpeta de *assets* de Angular, no la raíz de Hosting). Es ruido: se puede
borrar junto con `public/404.html`.

### 11.3 Lo que está roto en CI

Los dos workflows de `.github/workflows/` fallarían si se ejecutaran. Arreglo mínimo:

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: npm
- run: npm ci
- run: npx ng build          # 'ng' no está en el PATH del runner
```

Más: apuntar el disparador a la rama correcta (**`dev`**, no `main`) y resolver de dónde sale
`src/environments/environment.ts` en CI (un *secret* de GitHub que se escriba en un paso previo es lo
habitual).

### 11.4 Versiones

| Pieza | Versión | Nota |
|---|---|---|
| Node | ^18.19 · ^20.11 · ^22 | Exigido por Angular 18. Verificado con **v22**. |
| Angular | 18.2 | |
| `@angular/fire` | 18.0 | |
| Firebase SDK | 10.14 | |
| `@angular/material` / `cdk` | **17** | ⚠️ Desalineados con Angular 18 **y sin usar**. Quitar o actualizar. |

---

## 12. Costos y rendimiento

Firestore cobra **por documento leído**, y el patrón de este código multiplica las lecturas. Al
volumen actual cabe en el *free tier* (50.000 lecturas/día); con unos cientos de familias y varias
personas usando la app a diario, deja de caber.

### 12.1 N+1 en la tabla de aportantes

Una lectura extra por fila, como *listener* permanente ([§8.3](#83-pintado-de-la-tabla-de-aportantes-y-sus-dos-problemas)).
**Arreglo:** desnormalizar el nombre de la familia en el documento del aportante.

### 12.2 La búsqueda de familias baja todo

```ts
search() {                                  // se dispara en (input): cada tecla
  this.firestoreService.getRecords('Familias').subscribe(...)   // colección ENTERA
}
```

Con 500 familias, escribir "MARTINEZ" son **8 pulsaciones × 500 = 4.000 lecturas** y 8 listeners
abiertos que nunca se cierran.

**Arreglos, de menor a mayor esfuerzo:** (a) cargar `Familias` **una vez** en un servicio y filtrar en
memoria — correcto a este volumen; (b) añadir *debounce* de 300 ms; (c) a partir de miles de
registros, un índice de búsqueda externo.

### 12.3 Listeners que no se cierran

Ver [§9](#9-frontend-convenciones-y-estado). Cada listener vivo sigue facturando cuando el dato
cambia. Es la causa de costo más silenciosa de las tres.

---

## 13. Orden de construcción propuesto

Esto **no es un plan de producto** — eso lo decide la Misión. Es el orden técnico que hace que todo
lo demás sea más barato y seguro. Cada fase entrega algo verificable.

| Fase | Entregable | Criterio de salida |
|---|---|---|
| **0** | 🔒 **Cerrar `firestore.rules`** + probarlas con el emulador | Una sesión sin autenticar no lee nada; el personal autenticado sigue trabajando igual |
| **0** | Arreglar el arranque en frío: `environment.example.ts` + README | Alguien nuevo clona y levanta la app sin preguntar nada |
| 1 | CI que de verdad corre: `npm ci` + build + test, en la rama `dev` | El PR se pone en rojo cuando algo rompe |
| 2 | Limpieza: borrar código muerto (`firesvc`, modelos de clínica, `app-routing.module`, jQuery y Bootstrap 3 de `index.html`) | El repositorio solo contiene lo que se usa |
| 3 | Extraer `AportantesService` con el dominio (saldo, estado, meses) + **pruebas unitarias reales** | Las reglas de [§7](#7-reglas-de-negocio-del-programa) están cubiertas por tests |
| 4 | Guards de rutas (`CanActivateFn`) y baja de suscripciones (`takeUntilDestroyed`) | Sin comprobaciones de rol copiadas en `ngOnInit`; sin listeners huérfanos |
| 5 | Arreglar el N+1 y la búsqueda (desnormalizar, *debounce*) | Pintar la tabla cuesta una lectura por aportante, no dos |
| 6 | `costoAporte` y demás parámetros a un documento de configuración | Cambiar la cuota no exige desplegar |
| 7 | Migrar `aportes[]` a subcolección con documentos inmutables ([ADR-05](#adr-05--un-aporte-es-un-elemento-de-un-array-dentro-del-documento-del-aportante)) | Se puede responder "¿cuánto se recaudó en marzo?" con una consulta |
| 8 | Completar **Entregas** y **Canastas** con datos reales | Se dejan de mantener planillas aparte |
| 9 | Dashboard con datos de verdad | Los números de la portada salen de Firestore |

**Las dos fases 0 no tienen orden entre sí, pero van antes que todo lo demás.**

---

## 14. Registro de decisiones y desviaciones

> Cuando te apartes de lo que dice este documento, **añade una fila**. Es más valioso que la fila
> diga "lo hicimos distinto porque X" a que el documento mienta.

| Fecha | ADR / §  afectado | Desviación | Razón | Revisar en |
|---|---|---|---|---|
| 2026-09-11 | — | Se redacta este documento describiendo el estado real, incluidas las decisiones que nunca fueron explícitas | El proyecto se abre a voluntariado y necesita un mapa honesto antes que uno aspiracional | Cuando se cierre la Fase 0 |
| | | | | |

---

## 15. Anti-patrones y checklist

### 15.1 Anti-patrones presentes en este repositorio

| Anti-patrón | Dónde | Consecuencia |
|---|---|---|
| Reglas de Firestore abiertas | `firestore.rules` | **Toda la base expuesta a internet** |
| Autorización comprobada en el cliente | `ngOnInit` de varios componentes | Falsa sensación de seguridad |
| Suscripciones que nunca se cierran | Todo el código | Fugas de memoria y de dinero |
| Consultar dentro de un bucle (N+1) | `AportantesComponent.ngOnInit` | Lecturas ×2 y **nombres cruzados de fila** |
| Descargar una colección entera para filtrar | `FamiliasComponent.search()` | Lecturas ×N por cada tecla |
| jQuery manipulando el DOM de Angular | `src/index.html` | Comportamiento fantasma, imposible de depurar |
| Historial de negocio dentro de un array del documento | `aportes[]` | Sin consultas, sin auditoría, con carreras |
| Bitácora dentro de un string | `aporte.descripcion` | El dato existe pero no se puede consultar |
| Fechas como texto sin normalizar | `"2025-4-2"` | Cualquier `orderBy` dará resultados falsos |
| Parámetro de negocio incrustado en el código | `costoAporte = 150` | Cambiarlo reinterpreta el histórico |
| Código muerto de otro proyecto | `firesvc`, modelos de clínica | Quien llega no sabe qué mirar |
| Componentes comentados enteros | `beneficiarios.component.ts` | El nombre promete algo que no hace |
| Pruebas que solo son andamios | Todos los `.spec.ts` | Ningún cambio está protegido |
| CI que no puede funcionar | `.github/workflows/` | Verde falso, o rojo permanente ignorado |

### 15.2 Checklist antes de dar el proyecto por "en producción"

**Seguridad**
- [ ] `firestore.rules` deniega por defecto y se probó con el emulador
- [ ] Caso negativo explícito: sin sesión no se lee nada
- [ ] Datos personales y de salud: decidido quién los ve y cuánto se conservan
- [ ] Sin correos, UIDs ni IDs reales incrustados en el código

**Arranque del proyecto**
- [ ] Una clonación limpia levanta con lo que dice el README, sin preguntar
- [ ] `environment.example.ts` versionado
- [ ] Documentado cómo dar de alta a una persona usuaria (`Usuarios/{uid}`)

**Calidad**
- [ ] CI ejecuta `npm ci`, build y tests en la rama de trabajo
- [ ] Las reglas de negocio de [§7](#7-reglas-de-negocio-del-programa) tienen pruebas unitarias
- [ ] Sin componentes comentados ni servicios muertos

**Datos**
- [ ] Fechas normalizadas (ISO o `Timestamp`)
- [ ] Índices compuestos en `firestore.indexes.json`, no solo en la consola
- [ ] Los aportes se pueden consultar y no se pueden reescribir en silencio
- [ ] Copia de seguridad de Firestore programada ← **hoy no existe ninguna**

**Costo**
- [ ] Sin consultas dentro de bucles
- [ ] Toda suscripción se cierra al destruir el componente
- [ ] Alerta de presupuesto configurada en Google Cloud

---

## 16. Preguntas abiertas para el equipo

Ninguna de estas se puede responder leyendo el código. **Necesitan a la Misión.**

1. **¿Un aporte puede cubrir varios meses?** Hoy avanza un mes siempre, aunque se paguen seis
   ([§7](#7-reglas-de-negocio-del-programa)). Es probablemente el error de negocio más caro que hay.
2. **¿Qué pasa cuando cambia la cuota de 150 Bs?** ¿El histórico se reinterpreta o cada aporte
   conserva la cuota con la que se cobró?
3. **¿Puede una familia ser aportante y beneficiaria a la vez?** De eso depende [ADR-04](#adr-04--los-datos-operativos-cuelgan-del-distrito-el-padrón-de-familias-es-global).
4. **¿Cuántos distritos hay en realidad y quién administra cada uno?** El soporte multi-distrito está
   a medias y el código solo mira `roles[0]`.
5. **¿Qué roles existen además de `SuperAdmin`?** Sin la lista, no se pueden escribir las reglas.
6. **¿Entregas y Canastas se van a construir, o se gestionan fuera de la app?** Hoy son maquetas que
   aparentan funcionalidad.
7. **¿Qué datos de salud se piensan guardar, si es que alguno?** Cambia por completo las obligaciones
   sobre esos datos.
8. **¿Hay histórico en planillas que haya que importar?** Condiciona el modelo de datos.

---

## Apéndice · Mapeo de servicios

| Pieza | Servicio | Nota |
|---|---|---|
| Frontend | Angular 18 (standalone) | Sin SSR |
| Hosting | Firebase Hosting | Estático + rewrite SPA |
| Autenticación | Firebase Auth (Google) | La autorización se lee de Firestore ([ADR-03](#adr-03--identidad-con-google-la-autorización-vive-en-firestore)) |
| Base de datos | Cloud Firestore | Fuente de verdad única |
| Realtime Database | *provista y sin usar* | Quitar `provideDatabase` de `app.config.ts` |
| Estilos | Bootstrap 5 + Bootstrap Icons (CDN) | Angular Material instalado y sin usar |
| CI/CD | GitHub Actions + `action-hosting-deploy` | Roto hoy ([§11.3](#113-lo-que-está-roto-en-ci)) |
| Pruebas | Karma + Jasmine | Solo andamios |
| Analítica / trazas | **Ninguna** | No hay forma de saber si algo falla en producción |
| Copias de seguridad | **Ninguna** | Ver checklist |
