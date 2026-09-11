# Tu Familia es Mi Familia — App MFETF

Aplicación web interna de **[Misión Gran Río](https://www.facebook.com/Misi%C3%B3n-Gran-R%C3%ADo-Bolivia-828310233861530) (Bolivia)** para administrar el programa
solidario *"Tu Familia es Mi Familia"*: familias **aportantes** que cubren con una cuota mensual a
familias **beneficiarias**, las cuales reciben canastas de alimentos.

Angular 18 + Firebase (Auth · Firestore · Hosting). Todo el código y la interfaz están **en español**.

> ### 👋 ¿Llegas de voluntario/a?
>
> Lee esto entero: son cinco minutos y te ahorran una tarde. Luego pasa a
> **[`docs/arquitectura.md`](docs/arquitectura.md)**, que cuenta cómo está construido el sistema
> —incluido lo que está roto— sin adornos.
>
> **Dos cosas que conviene saber antes de empezar:**
> 1. Una clonación limpia **no compila**: falta un archivo de configuración que no está en el
>    repositorio. Lo resuelve el [paso 2](#2-configurar-firebase).
> 2. Iniciar sesión con Google **no alcanza** para entrar: además hace falta un registro en la base
>    de datos. Lo resuelve el [paso 3](#3-darte-de-alta-como-usuario).

---

## Índice

- [Estado del proyecto](#estado-del-proyecto)
- [Glosario del dominio](#glosario-del-dominio)
- [Puesta en marcha](#puesta-en-marcha)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Cómo contribuir](#cómo-contribuir)
- [Por dónde empezar](#por-dónde-empezar)
- [Despliegue](#despliegue)
- [Contacto](#contacto)

---

## Estado del proyecto

**Prototipo funcional en uso real, parcialmente terminado.** Un módulo está completo y en
producción; el resto son maquetas con datos inventados. El proyecto se abre a colaboración para
**terminarlo o, si el equipo lo decide, reformularlo**.

| Módulo | Estado |
|---|---|
| **Aportantes** — alta, aportes, saldos, estado de cuenta | ✅ Funciona y se usa |
| **Familias** — búsqueda, alta, edición | ✅ Funciona y se usa |
| **Login** con Google | ✅ Funciona |
| Dashboard | ⚠️ Maqueta (texto fijo + mapa embebido) |
| Entregas · Canastas | ⚠️ Maquetas con datos inventados |
| Beneficiarios · Distritos · Registro | ❌ Rotos o abandonados |
| Personas | 🚧 Escrito pero sin ruta: no se puede llegar |

### ⚠️ Antes que cualquier funcionalidad nueva

**Las reglas de seguridad de Firestore están completamente abiertas** (`allow read, write;`):
cualquier persona en internet puede leer y modificar toda la base de datos, que contiene nombres y
direcciones de familias en situación de vulnerabilidad.

Cerrarlas es la tarea prioritaria y **no requiere tocar el resto de la aplicación**.
Contexto y un esbozo de solución en
[`docs/arquitectura.md` §10](docs/arquitectura.md#10-seguridad).

Tampoco hay **copias de seguridad** ni **pruebas automatizadas** (los `.spec.ts` son los andamios
que genera el CLI).

---

## Glosario del dominio

Sin esto, el código no se entiende. Los nombres en Firestore y en el código usan estos términos.

| Término | Qué significa |
|---|---|
| **Familia** | Unidad básica del padrón. Puede ser aportante, beneficiaria o ambas. Los nombres se guardan **en MAYÚSCULAS**. |
| **Aportante** | Familia que aporta dinero al programa, con las familias beneficiarias que cubre. |
| **Beneficiaria** | Familia que recibe la ayuda. Una aportante puede cubrir varias. |
| **Aporte** | Un pago registrado: monto, mes que cubre, fecha de depósito, quién depositó y saldo resultante. |
| **Cuota (`costoAporte`)** | **150 Bs** por familia beneficiaria y por mes. Hoy está fija en el código. |
| **Saldo** | Dinero a favor (o en contra) de una aportante. Baja una cuota por cada mes transcurrido. |
| **Estado** | `Activo` si el saldo es ≥ 0; `Debe` si es negativo. Se calcula al mostrar la tabla. |
| **Distrito** | División territorial de la Misión. Los aportantes cuelgan de un distrito. |
| **Canasta** | Conjunto de alimentos que recibe una familia beneficiaria. *(No implementado.)* |
| **Entrega** | Acto de entregar las canastas en una fecha. *(No implementado.)* |
| **Bs** | Bolivianos, la moneda de Bolivia. |

---

## Puesta en marcha

### Requisitos

- **Node.js** ^18.19, ^20.11 o ≥22 (lo exige Angular 18; probado con **v22**)
- **npm** 10+
- Una cuenta de Google con acceso al proyecto Firebase `tfemf-839ad`
  — pídelo por [contacto](#contacto). *(Para trabajar solo la interfaz puedes usar tu propio
  proyecto de Firebase gratuito.)*

### 1. Instalar

```bash
git clone https://github.com/ilange007/app-mfetf.git
cd app-mfetf
npm install
```

### 2. Configurar Firebase

**Este paso es obligatorio: sin él el proyecto no compila.** La carpeta `src/environments/` está
en `.gitignore`, así que tienes que crearla:

```bash
mkdir -p src/environments
```

Crea `src/environments/environment.ts` con este contenido, sustituyendo los valores por los de tu
proyecto (Consola de Firebase → ⚙️ *Configuración del proyecto* → *Tus apps* → *Configuración del SDK*):

```ts
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: 'AIza…',
    authDomain: 'tfemf-839ad.firebaseapp.com',
    projectId: 'tfemf-839ad',
    storageBucket: 'tfemf-839ad.appspot.com',
    messagingSenderId: '000000000000',
    appId: '1:000000000000:web:abcdef…',
  },
};
```

Si prefieres no escribirlo a mano, el mismo generador que usa el CI sirve en local:

```bash
export FIREBASE_CONFIG='{"apiKey":"…","authDomain":"…","projectId":"…","appId":"…"}'
npm run generar-environment
```

> **Nota.** Esta configuración **no es un secreto**: viaja dentro del JavaScript que descarga
> cualquier visitante. Lo que protege los datos son las reglas de Firestore, no ocultar este archivo.
> Aun así, mantenlo fuera del repositorio: así cada quien apunta al proyecto que le corresponde.

### 3. Darte de alta como usuario

**Autenticarte con Google no basta.** La app busca un documento `Usuarios/{tu-uid}` en Firestore y,
si no existe, te devuelve a `/login` una y otra vez. No hay pantalla de registro: el alta es manual.

1. Arranca la app (paso 4) e intenta iniciar sesión con Google. Fallará, pero tu cuenta ya quedará
   creada en **Firebase Console → Authentication → Users**. Copia tu **UID**.
2. En **Firestore Database**, crea el documento `Usuarios/{tu-uid}`:

```jsonc
{
  "personaId": "",
  "roles": [
    { "nombreRol": "SuperAdmin", "idDistrito": "<id de un documento de la colección Distritos>" }
  ]
}
```

3. Recarga. Ya deberías entrar.

> `SuperAdmin` es el único rol que el código comprueba hoy. Si no existe ningún distrito, crea un
> documento en la colección `Distritos` y usa su ID.

### 4. Arrancar

```bash
npm start          # http://localhost:4200
```

Otros comandos:

```bash
npm run build      # compila a dist/app-mfetf/browser
npm test           # Karma + Jasmine (hoy solo andamios generados)
npm run watch      # build en modo desarrollo, recompilando
```

### Problemas frecuentes

| Síntoma | Causa |
|---|---|
| `Cannot find module '../environments/environment'` | Te falta el [paso 2](#2-configurar-firebase). |
| Vuelve siempre a `/login` tras entrar con Google | Te falta el [paso 3](#3-darte-de-alta-como-usuario): no existe tu `Usuarios/{uid}`. |
| `/familias` te expulsa a `/login` | Tu documento de usuario no tiene el rol `SuperAdmin`. |
| El popup de Google no abre | El navegador lo bloqueó, o falta `localhost` en Firebase Console → Authentication → Settings → *Dominios autorizados*. |
| Tabla de aportantes vacía | Tu `idDistrito` no coincide con ningún distrito que tenga aportantes. |

---

## Estructura del repositorio

```
src/
├── app/
│   ├── app.config.ts          # bootstrap: providers de Firebase y router
│   ├── app.routes.ts          # rutas (app-routing.module.ts está MUERTO, ignóralo)
│   ├── app.component.*        # cabecera, menú lateral, router-outlet, pie
│   │
│   ├── services/
│   │   ├── firestore.service.ts   # CRUD genérico por ruta de colección
│   │   ├── loginsvc.service.ts    # sesión, rol y distrito activo
│   │   └── firesvc.service.ts     # 💀 MUERTO — de otro proyecto, nadie lo usa
│   │
│   ├── aportantes/            # ✅ el módulo completo: úsalo de referencia
│   ├── familias/              # ✅ búsqueda y edición (también sirve de modal)
│   ├── login/  menu/  dashboard/
│   ├── entregas/  canasta/    # ⚠️ maquetas con datos inventados
│   ├── beneficiarios/         # 🧟 comentado entero; la clase viva es copia de familias
│   ├── distritos/  registro/  # ❌ rotos
│   ├── personas/              # 🚧 sin ruta
│   └── models/                # clases de dominio (varias son de otro proyecto)
│
├── index.html                 # ⚠️ contiene jQuery y Bootstrap 3 que pelean con Angular
└── styles.css                 # estilos globales

docs/arquitectura.md           # 📖 cómo funciona todo y qué está mal
firestore.rules                # ⚠️ hoy abiertas de par en par
```

---

## Cómo contribuir

Toda ayuda sirve: código, pruebas, diseño, documentación o simplemente probar la app y reportar
qué no cuadra.

### Flujo de trabajo

1. La rama base es **`dev`**.
2. Crea tu rama desde ahí: `git checkout -b feat/lo-que-sea`.
3. Commits en español, en imperativo y explicando el *porqué*:
   `Cerrar reglas de Firestore para usuarios no autenticados`.
4. Abre un Pull Request hacia `dev` describiendo **qué cambia y cómo probarlo**.

### Convenciones

- **Español** en código, comentarios, interfaz y commits.
- Componentes **`standalone: true`** con imports explícitos (no hay `NgModule`).
- **Formularios reactivos** (`FormGroup`/`FormArray`), no `ngModel`, en lo nuevo.
- Colecciones de Firestore en **plural y con mayúscula inicial** (`Familias`, `Usuarios`); campos en
  `camelCase`.
- Indentación de 2 espacios, comillas simples en TypeScript (hay `.editorconfig`).
- **Cierra tus suscripciones** (`takeUntilDestroyed` o el pipe `async`). El código actual no lo hace
  y es una fuga de memoria y de dinero; no añadas más.

### Antes de abrir el PR

- [ ] `npm run build` pasa
- [ ] Probaste el flujo a mano en el navegador
- [ ] No subiste `src/environments/` ni credenciales
- [ ] Si cambiaste algo estructural, lo anotaste en
      [`docs/arquitectura.md` §14](docs/arquitectura.md#14-registro-de-decisiones-y-desviaciones)

---

## Por dónde empezar

Ordenado por impacto. El detalle técnico de cada punto está en
[`docs/arquitectura.md` §13](docs/arquitectura.md#13-orden-de-construcción-propuesto).

**🔴 Urgente**

1. **Cerrar las reglas de Firestore.** Hay un esbozo en
   [§10.1](docs/arquitectura.md#101-el-agujero-abierto). Pruébalas con el emulador **antes** de
   desplegar: unas reglas mal puestas dejan la app inservible al instante.
2. **Configurar copias de seguridad** de Firestore. Hoy no hay ninguna.

**🟠 Hace más fácil todo lo demás**

3. Versionar `src/environments/environment.example.ts` para que el arranque en frío no sea un muro.
4. **Borrar el código muerto**: `firesvc.service.ts`, los modelos de clínica/paciente/solicitud,
   `app-routing.module.ts`, y el bloque de jQuery y Bootstrap 3 de `index.html`. Lo primero de esa
   lista además **desbloquea los tests**: hoy `ng test` ni siquiera compila por su culpa, y por eso
   el CI todavía no los ejecuta.

**🟡 Buenos primeros aportes**

6. Extraer la lógica de saldos y estados de `AportantesComponent` a un servicio **con pruebas
   unitarias**. Es la forma más barata de que el proyecto empiece a tener tests de verdad.
7. Sustituir las comprobaciones de rol repetidas en `ngOnInit` por un `CanActivateFn`.
8. Arreglar la búsqueda de familias: hoy descarga la colección entera **en cada tecla**.
9. Arreglar la carrera en la tabla de aportantes: los nombres de familia se pueden cruzar de fila
   ([§8.3](docs/arquitectura.md#83-pintado-de-la-tabla-de-aportantes-y-sus-dos-problemas)).

**🟢 Funcionalidad nueva** *(consulta antes con la Misión: hay [preguntas de dominio sin
responder](docs/arquitectura.md#16-preguntas-abiertas-para-el-equipo))*

10. Que un aporte pueda cubrir **varios meses**. Hoy avanza uno solo aunque se paguen seis: es
    probablemente el error de negocio más caro que hay.
11. Construir **Entregas** y **Canastas** de verdad.
12. Dashboard con datos reales en vez de texto fijo.

---

## Despliegue

Automático, con **dos entornos**:

| Haces merge a… | Se despliega a… | Proyecto Firebase |
|---|---|---|
| `master` | **Producción** | `tfemf-839ad` |
| `staging` | **Staging** | `tfemfdev` |
| *(cualquier PR)* | Vista previa temporal (7 días) | `tfemfdev` |

Trabaja contra `staging` y deja `master` para lo que ya esté probado.

El CI compila con `npm ci` + `ng build` y genera `src/environments/environment.ts` a partir de los
secrets del repositorio antes de compilar. Los PR que vienen de un fork no reciben secrets: en ese
caso se compila con una configuración de relleno solo para verificar que el proyecto compila, y no
se publica vista previa.

Si necesitas desplegar a mano:

```bash
npm run build
npx firebase deploy --only hosting -P produccion   # o -P staging
```

Detalle completo en [`docs/arquitectura.md` §11.2](docs/arquitectura.md#112-entornos-y-despliegue-continuo).

---

## Contacto

**Misión Gran Río Bolivia**

- [Facebook](https://www.facebook.com/Misi%C3%B3n-Gran-R%C3%ADo-Bolivia-828310233861530)
- [Instagram](https://www.instagram.com/mision_gran_rio_bolivia/?hl=es-la)
- [YouTube](https://www.youtube.com/channel/UCwbIG3IDTHz8VZm24UxULnQ)
- [WhatsApp](https://api.whatsapp.com/send?phone=59169333321)

Para dudas técnicas o acceso al proyecto Firebase, abre un *issue* en este repositorio.

---

© Misión Gran Río
