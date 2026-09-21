<div align="center">

# Car Follow

**El historial de mantención de tu vehículo, compartido entre quien lo maneja y quien lo repara.**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![pnpm](https://img.shields.io/badge/pnpm-workspaces-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![Turborepo](https://img.shields.io/badge/Turborepo-2-EF4444?logo=turborepo&logoColor=white)](https://turbo.build)

![App de la persona](docs/persona.png)

</div>

## El problema

El historial de mantención de un vehículo vive partido en dos: lo que el taller anotó
en su sistema y lo que el dueño recuerda. Cuando el auto cambia de manos, o de taller,
esa información se pierde.

**Car Follow** es un solo historial con dos formas de escribir en él: una app móvil para
la persona y un panel web para el taller. Cada cambio queda **firmado por su autor** y
nada se sobrescribe — si el taller anota 82.600 km y el dueño lo corrige a 82.640, quedan
las dos entradas con su firma y su hora.

## Qué demuestra este proyecto

| | |
|---|---|
| **Nada de estado duplicado** | Los recordatorios, la barra de progreso y el estado de cada vehículo **no se guardan**: se derivan del último trabajo que cubrió cada pieza más su regla por km/meses. Registrar una mantención mueve el recordatorio solo, sin sincronizar dos fuentes de verdad. |
| **Monorepo real** | pnpm workspaces + Turborepo: dos apps y tres packages compartidos, con un contrato de tipos único (`@cf/types`) pensado para que el backend futuro lo reutilice. |
| **Design system propio** | Tokens de color en CSS custom properties, tema claro/oscuro persistido, y componentes compartidos entre ambas apps (`@cf/ui`). |
| **Audit trail en el modelo** | El historial es append-only por diseño: cada `Revision` guarda autor, descripción y timestamp. La propiedad se sostiene desde el tipo, no desde la UI. |
| **Criterio, no abstracción** | El repo sigue reglas de decisión explícitas: regla de tres, prohibido el parámetro-bandera, sin indirección de un solo uso. `formatDate` está duplicada a propósito porque son dos formatos distintos, no una función con un flag. |
| **Arquitectura pensada** | El plan de backend, el modelo de autenticación y las decisiones de seguridad están razonados abajo, incluyendo por qué **no** se usa Next.js acá. |

> **Estado:** las dos apps consumen la API del repo
> ([BF-Car-Follow](https://github.com/Sebastianaac1/BF-Car-Follow)) sobre PostgreSQL. No
> queda nada en memoria: los dos `store.tsx` están borrados y cada pantalla pide lo suyo.
> **Sigue sin haber tests** — todo se verificó con scripts contra la API y el navegador a
> mano. Los dos repos están listos para desplegar (Render + Vercel).

### Cómo se derivan los recordatorios

Cada pieza tiene una regla (`cada 10.000 km · o 12 meses`). Para cada vehículo se busca
el trabajo más reciente que la cubrió y se calcula cuánto del intervalo se consumió por
kilometraje y por tiempo. **Gana el eje que va más adelante** — el que dispara primero:

```ts
const byKm   = (vehicle.odometer - last.odometer) / rule.intervalKm;
const byTime = monthsSince(last.date) / rule.intervalMonths;
const progress = Math.max(byKm, byTime);   // >= 0.8 → "pronto", >= 1 → "vencido"
```

El estado del vehículo es el peor de sus piezas. Una pieza sin ningún trabajo registrado
no genera recordatorio: no hay desde dónde contar el intervalo. Todo esto vive en
`packages/mock-data/src/index.ts` y se muda al backend tal cual cuando exista.

### Sesión, roles y guardas de ruta

**El rol no se elige al entrar: se descubre.** El login pide solo correo y contraseña,
busca la cuenta en el directorio y lee su `role`. Si esa cuenta pertenece a la otra app,
te redirige a ella. El tipo de cuenta se elige **una sola vez, en `/registro`**.

```ts
const cuenta = accountByEmail(email);
if (!cuenta)                    → "No hay ninguna cuenta con ese correo."
if (cuenta.role !== "taller")   → redirige a la app de la persona
else                            → entra
```

Esto importa más allá del formulario: un cliente que elige su propio rol es un cliente
que se auto-asigna permisos. El rol es un dato de la cuenta que resuelve el servidor.

Sin sesión ninguna pantalla se monta — te manda a `/login` recordando a dónde ibas, y al
entrar vuelves ahí. La sesión vive en `sessionStorage`, no en `localStorage`, que es lo
mismo que hará el JWT cuando exista.

| Cuenta de prueba | Rol |
|---|---|
| `martin@correo.cl` | persona |
| `lucia@correo.cl` | persona |
| `contacto@tallercfnorte.cl` | taller |

> ⚠️ **Nada de esto es seguridad.** El directorio de cuentas es un array en el cliente y
> la contraseña no se valida ni se guarda: no hay servidor contra el cual validarla, y
> hashearla en el navegador no protegería nada. Las guardas de ruta son de experiencia
> de usuario — un cliente siempre se las puede saltar. La autorización real tiene que
> vivir en cada endpoint del backend, y está diseñada abajo.
>
> Las cuentas creadas en `/registro` quedan en el `localStorage` de ese origen. Sin
> servidor no hay forma de compartirlas entre `app.` y `taller.carfollow.io`: por eso
> elegir el tipo "del otro lado" te lleva a registrarte allá.

## Las dos apps

### Panel del taller

Dashboard ordenado por urgencia, con búsqueda y ficha de auditoría que muestra quién
tocó qué y cuándo. La columna **Próximo** y el estado de cada fila salen del cálculo,
no de datos guardados.

![Panel del taller](docs/taller.png)

Los recordatorios se seleccionan y abren un panel con las acciones sobre el cliente —
llamar, mandar el aviso por WhatsApp con el mensaje ya redactado, o saltar directo a
registrar el trabajo con el vehículo preseleccionado:

![Recordatorios con panel de acciones](docs/recordatorios.png)

Cada vehículo tiene su ficha en `/vehiculos/:id`, con las próximas mantenciones, el
historial completo y el audit trail de cada corrección:

![Ficha del vehículo](docs/vehiculo.png)

Tema claro incluido, con la misma paleta portada a valores accesibles:

![Panel del taller en tema claro](docs/taller-claro.png)

### App de la persona

Garaje, detalle del vehículo con su historial, registro de mantenciones y de vehículos,
reglas por pieza y alertas derivadas de las mismas reglas que usa el taller.

Es una **app web**: ocupa la ventana, con la navegación arriba y el contenido en un
contenedor centrado. Por debajo de 760px esa navegación baja a una tab bar fija — la misma
lista de secciones pintada de dos formas, y el CSS decide cuál se ve. Antes esto era un
marco de teléfono dibujado en el medio de la pantalla: servía para presentar el prototipo,
no para usarlo.

## Correr el proyecto

Requiere **Node 20+** y **pnpm 10+**.

```bash
pnpm install
pnpm dev          # ambas apps a la vez
```

| App | URL | Script individual |
|---|---|---|
| Persona | http://localhost:5173 | `pnpm dev:persona` |
| Taller (web) | http://localhost:5174 | `pnpm dev:taller` |

Otros scripts: `pnpm build`, `pnpm typecheck`.

Las dos apps hablan con la API en `http://localhost:3000`, así que para verlas con datos
hay que tener el backend corriendo (`pnpm dev` en su repo). Las URLs no están escritas en
el código: salen de `VITE_API_URL`, `VITE_URL_TALLER` y `VITE_URL_PERSONA`, y los valores
por defecto son los puertos de desarrollo — ver `.env.example`.

> `pnpm lint` hoy ejecuta `tsc --noEmit`, igual que `typecheck`. No hay ESLint configurado
> todavía y el README no va a decir lo contrario.

## Estructura

```
apps/
  persona/     App móvil de la persona dueña del vehículo   (:5173)
  taller/      Panel web del taller                          (:5174)
packages/
  ui/          Design system: tokens, tema y componentes compartidos
  types/       El contrato de tipos entre las dos apps y el backend
  mock-data/   Datos de ejemplo + la derivación de recordatorios
docs/          Capturas usadas en este README
project/       Diseño original exportado desde Claude Design (referencia)
```

Las dos apps **nunca se importan entre sí**. Si ambas necesitan lo mismo, va a un package;
si lo usa una sola, se queda en esa app.

### `packages/` — lo compartido

| | Qué hace |
|---|---|
| `types/` | **El contrato.** `Vehicle`, `MaintenanceRecord`, `PartRule`, `Revision`, `Account`… Es el único lugar de los DTOs, y el backend devuelve exactamente estas formas. Cambiar un tipo acá rompe la compilación de las dos apps a la vez, que es justo lo que se quiere. |
| `ui/` | El design system. `theme.ts` tiene la paleta en tokens CSS, `ThemeProvider.tsx` persiste claro/oscuro, `components.tsx` trae `Logo`, `StatusBadge`, `ProgressBar`, `AuthorPill` y `Card`, y `styles.css` los estilos base. Solo entra lo que usan **ambas** apps. |
| `mock-data/` | **Ya no lo importa ninguna app.** Fue donde vivió la derivación de recordatorios hasta que se mudó al backend; queda como la implementación de referencia contra la que se verificó esa mudanza, campo por campo. Borrarlo es una decisión pendiente, no un trámite. |

### `apps/persona/src/` — la app de la persona

| | Qué hace |
|---|---|
| `main.tsx` | El arranque: monta React con el `ThemeProvider` y el router. |
| `App.tsx` | **El mapa de rutas y la guarda.** Sin sesión solo existen `/login` y `/registro`; el resto redirige recordando a dónde iba. |
| `sesion.tsx` | Guarda el token en `sessionStorage` bajo `cf-sesion-persona`. La app nunca lo abre: solo lo manda en el header. |
| `api.ts` | **El puente con el backend.** `api()` pone el token y traduce los errores de Nest; `useApi()` agrega `cargando`, `error` y `recargar`, y descarta la respuesta vieja si la pantalla cambió antes de que llegue. |
| `Estado.tsx` | `<Cargando>` y `<ErrorApi>` con botón de reintentar. Los dos estados que solo existen cuando los datos vienen de la red. |
| `Layout.tsx` + `layout.css` | El marco de la app: barra arriba, tab bar abajo en pantallas angostas. |
| `format.ts` | `km()` y `formatDate()`. Da `04 mar 2025` — distinto del taller **a propósito**. |
| `screens/` | Una pantalla por archivo: `Garaje`, `VehicleDetail` + `DetailBody`, `NuevoVehiculo`, `Registrar`, `Alertas`, `Historial`, `Perfil`, `Reglas`, `Login` y `Registro`. |

### `apps/taller/src/` — el panel web

Misma estructura, otra forma. Los archivos que se repiten de nombre **no son el mismo archivo**.

| | Qué hace |
|---|---|
| `App.tsx` | Rutas y guarda, igual que persona. Con sesión, todo se monta dentro del `Layout`. |
| `Layout.tsx` | La barra lateral: navegación, nombre del taller (que viene de la sesión), toggle de tema y cerrar sesión. |
| `sesion.tsx` · `api.ts` · `Estado.tsx` | Los mismos tres archivos que en persona, **duplicados a propósito**: son dos claves de sesión y dos ciclos de vida distintos, y compartirlos obligaría a un paquete común con un solo archivo adentro. |
| `format.ts` | Da `04/03/2025`. La otra mitad de la duplicación deliberada. Suma `formatTimestamp()` para las marcas de tiempo del audit trail. |
| `pages/` | `Dashboard` (KPIs), `Vehiculos` + `VehiculoDetalle`, `Clientes`, `Trabajos`, `Recordatorios`, `Ajustes`, `Login` y `Registro`. |
| `components/AuditPanel.tsx` | El panel de auditoría de un vehículo. Solo lo usa el taller, así que se queda acá y no sube a `@cf/ui`. |

### Configuración en la raíz

| | Qué hace |
|---|---|
| `turbo.json` | Define las tareas. `build` y `typecheck` dependen de `^build`: los packages se construyen antes que las apps. |
| `pnpm-workspace.yaml` | Declara que `apps/*` y `packages/*` son miembros del workspace. Es lo que hace que `workspace:*` resuelva. |
| `tsconfig.base.json` | Los flags que heredan los cinco paquetes, cada uno con su propio `tsconfig.json` que lo extiende. |

Los datos viven en React state y se reinician al recargar.

---

<details>
<summary><strong>Plan de backend</strong> — monolito modular NestJS + PostgreSQL + Prisma</summary>
<br />

Arquitectura pensada para el alcance actual, sin microservicios:

- **Monolito modular** con **NestJS + PostgreSQL + Prisma**, organizado por módulos:
  `auth`, `vehicles`, `maintenance`, `reminders`, `workshops` y `billing`.
- **Suscripción mensual/anual** para **talleres y personas** (freemium: hay un plan
  gratuito, el pago desbloquea límites/funciones). El módulo `billing` queda
  modelado en la base de datos desde ya (planes, estado de suscripción, fechas de
  ciclo) pero **sin integrar Stripe todavía** — se conecta cuando haya clientes
  reales pagando. Mientras tanto todo el mundo corre en el plan gratuito.
- `packages/types` ya define los DTOs para que frontend y backend compartan contrato.

Los módulos de NestJS dejan el corte listo por si algún día conviene separar alguna
pieza en su propio servicio.

### Autenticación

- **Email + contraseña** con JWT (access + refresh token). Dos roles: `persona` y
  `taller` — un mismo usuario de taller puede tener varios miembros de staff a
  futuro, pero para el alcance actual alcanza con un rol simple por cuenta.
- Vive en el módulo `auth` del monolito Nest; ambos frontends (persona y taller)
  consumen la misma API de auth.
- OAuth (Google) o magic link quedan abiertos para una iteración futura si hace
  falta reducir fricción de registro — no bloquean nada de lo de abajo.

</details>

<details>
<summary><strong>Seguridad</strong> — JWT, IDOR, hashing de contraseñas, inyección SQL</summary>
<br />

- **Credenciales nunca en el frontend**: el frontend no guarda contraseñas, API
  keys ni secretos — solo el JWT del usuario logueado, en memoria/`sessionStorage`
  (no `localStorage`, para reducir exposición a XSS). Toda variable sensible
  (secreto de firma JWT, credenciales de Postgres, claves de Stripe) vive en
  variables de entorno del backend / Docker secrets, nunca en el bundle del
  cliente ni comiteada al repo (`.env` en `.gitignore`, `.env.example` como
  plantilla).

- **Guard de propiedad en cada endpoint** (no solo autenticación, sino
  autorización): además del `AuthGuard` que valida el JWT, cada endpoint que
  toca un recurso (vehículo, mantención, cliente) lleva un guard que confirma
  que el `sub` (id de usuario) del token es dueño de ese recurso — o, en el caso
  del taller, que el vehículo/cliente pertenece a ese taller. Esto evita **IDOR**
  (que el usuario A cambie `/vehiculos/123` con el token de A pero el vehículo
  123 sea de B con solo adivinar el id). Se implementa como un `ResourceOwnerGuard`
  reusable en Nest, más un `RolesGuard` aparte para separar rutas exclusivas de
  `persona` vs `taller`.

- **JWT — qué va en el payload y cuánto dura**: un JWT está *firmado*, no
  *cifrado* — cualquiera puede decodificar el payload (es base64), solo no puede
  falsificarlo sin la clave. Por eso el payload lleva lo mínimo: `sub` (id de
  usuario), `role`, `exp` — nunca contraseña, ni email, ni datos sensibles.
  Firmado con secreto fuerte (o RS256 asimétrico si el token debe validarse desde
  varios servicios). Sobre expiración: un **access token corto** (recomendado
  15–60 min) + **refresh token** más largo (7–30 días, rotable y revocable en
  Redis/DB) es más seguro que un token único de larga duración, porque si el
  access token se filtra, la ventana de abuso es corta. Si se prefiere simplicidad
  para el MVP, un solo token de **12 h** es una opción razonable mientras no haya
  refresh implementado — quedaría como configuración (`JWT_EXPIRES_IN`) fácil de
  ajustar después sin tocar código.

- **Hash de contraseñas — por qué NO SHA-256**: SHA-256 es un hash de propósito
  general diseñado para ser *rápido*, y esa es exactamente la propiedad que no
  se quiere acá. Una GPU moderna calcula del orden de **10¹⁰ SHA-256 por
  segundo**, así que ante una filtración de la base de datos un diccionario
  revienta las contraseñas comunes en minutos. Tampoco lleva sal por sí solo:
  dos usuarios con la misma contraseña quedan con el mismo hash, y las rainbow
  tables hacen el resto.

  Lo correcto es un **KDF lento, salado y con costo configurable**. En orden de
  preferencia:

  | Algoritmo | Cuándo | Parámetros de partida |
  |---|---|---|
  | **Argon2id** ✅ | Elección por defecto — ganador del Password Hashing Competition, resistente a GPU y ASIC porque además de tiempo exige memoria | `m=19 MiB, t=2, p=1` (mínimo OWASP) |
  | **scrypt** | Alternativa si Argon2 no está disponible en el runtime | `N=2^17, r=8, p=1` |
  | **bcrypt** | Opción más probada y con más años de rodaje; tope de 72 bytes de entrada | `cost ≥ 12` |

  En Node: `argon2` (binding nativo) o `node:crypto.scrypt`. El hash **siempre se
  calcula en el servidor**: hacerlo en el navegador no protege nada — el hash
  pasa a *ser* la contraseña (quien lo intercepte se autentica con él) y de todas
  formas viaja por la red. El cliente manda la contraseña por HTTPS y el servidor
  la hashea.

  Además: throttling de intentos de login (`@nestjs/throttler`) para frenar
  fuerza bruta, y no revelar en el error si fue el email o la contraseña la que
  falló.

- **Inyección SQL en los endpoints de usuario**: **Prisma** parametriza las
  queries por diseño, así que el ORM ya evita la inyección clásica mientras no se
  usen `$queryRawUnsafe` / concatenación de strings (se prohíbe explícitamente en
  code review). Además, todo input de entrada pasa por **DTOs con
  `class-validator`** y el `ValidationPipe` global de Nest en modo
  `whitelist: true, forbidNonWhitelisted: true` — cualquier campo no declarado en
  el DTO se descarta antes de llegar a la capa de datos, así que ni siquiera hay
  superficie para intentarlo desde los campos de perfil, vehículos, etc.

- **TLS / HTTPS — es infraestructura, no código**: no se "agrega" a la app; se
  termina en el reverse proxy. **Traefik** delante de todo con certificados
  automáticos de **Let's Encrypt** (renovación sola cada 90 días), redirección
  `301` de `:80` a `:443`, TLS 1.2+ y **HSTS** (`Strict-Transport-Security`, vía
  `helmet`) para que el navegador ni intente HTTP después de la primera visita.
  Las cookies —si en algún momento se usan en vez del header `Authorization`—
  van `Secure`, `HttpOnly` y `SameSite=Lax`. En desarrollo local se sigue
  trabajando sobre HTTP: el certificado se emite recién cuando hay un dominio
  real apuntando al VPS.

- **Otros mínimos de higiene** que quedan incluidos en el mismo esfuerzo: CORS
  restringido a los subdominios propios (`app.` / `taller.carfollow.io`), cabeceras
  de seguridad con `helmet`, y el historial de auditoría (quién firmó cada cambio)
  que ya es parte del modelo de datos y sirve también como rastro de seguridad.

</details>

<details>
<summary><strong>Despliegue y ADRs</strong> — Vercel, Render, Neon, y por qué no Next.js</summary>
<br />

### Dónde vive cada pieza

| Pieza | Dónde | Plan | Por qué ahí |
|---|---|---|---|
| `apps/persona` y `apps/taller` | **Vercel**, un proyecto por app | Hobby (gratis) | Son SPAs de Vite: compilan a estático y no necesitan servidor. |
| API de Nest (repo [BF-Car-Follow](https://github.com/Sebastianaac1/BF-Car-Follow)) | **Render**, web service | Free (gratis) | Es un proceso Node de larga duración; no cabe en Vercel. |
| PostgreSQL | **Neon** | Free (gratis) | Ahí está desde el primer día; el backend entra por `DATABASE_URL`. |

Todo en capa gratuita. Lo que eso implica (verificado en las páginas de precios,
septiembre 2026):

- **Vercel Hobby** es solo para uso personal, no comercial. Si Car Follow pasa a ser
  negocio, se sube a Pro.
- **Render Free** duerme el servicio a los 15 minutos sin tráfico y tarda ~1 minuto en
  despertar: el primer request después de un rato es lento. Su Postgres gratis expira
  a los 30 días — por eso la base **no** va ahí.
- **Neon Free** suspende el cómputo a los 5 minutos sin uso; la primera query después
  tarda ~1 s.

### Cómo se conectan

- En Vercel cada app es un proyecto con *Root Directory* `apps/persona` o `apps/taller`;
  el build es el `pnpm build` de esa app (`tsc -b && vite build`) y la salida es `dist/`.
- Cada app tiene su `vercel.json` con el rewrite de todas las rutas a `index.html`, que es
  lo que necesita react-router para que entrar directo a `/alertas` no dé 404.
- **Las dos** apps leen `VITE_API_URL`. Además cada una lee el dominio de la otra
  (`VITE_URL_TALLER` / `VITE_URL_PERSONA`) para el cruce: entrar con una cuenta que no
  corresponde a esa app te manda a la otra. Sin las variables, las tres caen a los puertos
  de desarrollo. Todo lo que Vite expone es **público**: ahí no va ningún secreto.
- Los paquetes de `packages/` no tienen paso de build (`main` apunta al `.ts`), así que
  cada app compila sola sin depender de que la otra se haya construido antes.
- El backend tiene lista blanca de CORS por `ORIGENES_WEB`: **los dominios que Vercel
  asigne hay que cargarlos ahí después**, o el navegador corta todas las llamadas sin que
  aparezca un solo error en el servidor. Es el paso que se olvida.

Hoy **nada está desplegado todavía**: esta sección fija la decisión, no describe algo
que ya corre.

### ADRs

- **Vite (SPA) en vez de Next.js**: hay un backend Nest dedicado, ambas apps están
  detrás de login (sin necesidad de SSR/SEO), y la app de la persona apunta a móvil
  a futuro (Capacitor/React Native) — Next añadiría un segundo tier de servidor sin
  aportar nada en este caso. Si más adelante se necesita una landing pública
  indexable, esa sí se construiría con Next como proyecto aparte (`apps/web`).
- **Plataformas gestionadas gratis en vez de VPS propio**: el plan original era Docker en
  un VPS con Traefik. Para el tamaño actual — un prototipo, una persona — eso es más
  caro y más trabajo de operar que tres servicios gratuitos que despliegan desde `main`.
  Las apps siguen siendo estáticas y la API un proceso Node sin estado, así que
  dockerizarlas y moverlas a un VPS o a algo gestionado sigue siendo un paso de
  infraestructura, no de código.

</details>
