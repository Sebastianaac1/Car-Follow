# Car Follow (CF)

> El _"close friend"_ de tu vehículo — un solo registro de mantención, dos formas de usarlo.

Monorepo con dos aplicaciones que comparten un mismo historial de mantención firmado:
la **app de la persona** (móvil) y el **panel del taller** (web). Cada cambio en el
historial queda firmado por su autor (azul = persona, naranja = taller) y nada se
sobrescribe en silencio.

Implementación del diseño exportado desde Claude Design (ver `project/Car Follow.dc.html`
y `chats/`). Prototipo **navegable** con datos mock — sin backend todavía.

## Estructura

```
apps/
  persona/     App de la persona (React + Vite, móvil). Garaje, detalle+historial,
               registrar mantención, reglas por pieza, alertas.
  taller/      Panel del taller (React + Vite, web). Dashboard con KPIs, tabla de
               vehículos, ficha con auditoría, clientes, trabajos, recordatorios.
packages/
  ui/          Design system CF: tokens de color, ThemeProvider (claro/oscuro),
               componentes compartidos (Logo, StatusBadge, ProgressBar, AuthorPill…).
  types/       Tipos/DTOs compartidos (Vehicle, MaintenanceRecord, PartRule…).
  mock-data/   Datos de ejemplo derivados del diseño.
project/       Diseño original exportado (referencia).
chats/         Transcripción de la conversación de diseño (referencia).
```

## Requisitos

- Node 20+
- pnpm 10+

## Desarrollo

```bash
pnpm install

# ambas apps a la vez
pnpm dev

# o por separado
pnpm dev:persona   # http://localhost:5173
pnpm dev:taller    # http://localhost:5174
```

Otros scripts: `pnpm build`, `pnpm typecheck`.

El tema (claro/oscuro) se alterna arriba a la derecha (persona) o en la barra lateral
(taller) y se recuerda en `localStorage`.

## Qué es navegable hoy

- **Persona**: tabs Garaje / Historial / Alertas / Perfil; abrir un vehículo desde el
  garaje; registrar una mantención (se guarda en memoria y aparece firmada en el
  historial del vehículo); reglas por pieza.
- **Taller**: navegación por la barra lateral; seleccionar una fila de la tabla
  actualiza la ficha de auditoría; registrar un trabajo (aparece en "Trabajos
  recientes", firmado por el taller).

Los datos viven en memoria (React state) y se reinician al recargar. No hay
persistencia ni autenticación todavía.

## Plan de backend (siguiente etapa)

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

## Seguridad

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
  para el MVP, un solo token de **12 h** (tu ejemplo) es una opción razonable
  mientras no haya refresh implementado — quedaría como configuración (`JWT_EXPIRES_IN`)
  fácil de ajustar después sin tocar código.

- **Cifrado de contraseñas**: hash con **Argon2id** (o bcrypt con cost ≥ 12 si se
  prefiere la opción más probada), nunca texto plano ni cifrado reversible.
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

- **Otros mínimos de higiene** que quedan incluidos en el mismo esfuerzo: CORS
  restringido a los subdominios propios (`app.` / `taller.carfollow.io`), cabeceras
  de seguridad con `helmet`, HTTPS en todo (ya cubierto por Traefik + Let's
  Encrypt), y el historial de auditoría (quién firmó cada cambio) que ya es parte
  del modelo de datos y sirve también como rastro de seguridad.

## Despliegue: Docker en un VPS propio

- **Empaquetado**: cada pieza en su contenedor (`Dockerfile` multi-stage: build con
  pnpm → imagen final mínima). Las apps de Vite compilan a estático y se sirven con
  Nginx; Nest corre como proceso Node.
- **Orquestación**: `docker-compose.yml` con `persona`, `taller`, `api`, `worker`
  (jobs de recordatorios), `postgres`, `redis`.
- **Host**: un VPS (Hetzner / DigitalOcean tipo) corriendo `docker compose`. Simple
  y barato para arrancar; con las imágenes ya hechas, migrar después a algo
  gestionado (Fly.io, ECS, Kubernetes) es un paso de infraestructura, no de código.
- **Reverse proxy + HTTPS**: **Traefik** delante de todo, certificados automáticos
  vía Let's Encrypt.
- **Dominios**: subdominios separados —
  - `app.carfollow.io` → app de la persona
  - `taller.carfollow.io` → panel del taller
  - `api.carfollow.io` → API de Nest
- **CI/CD**: GitHub Actions build de las imágenes en cada push a `main` → deploy por
  SSH al VPS (`docker compose pull && docker compose up -d`).
- **Escalar con el tiempo**: los frontends ya son estáticos (CDN-friendly, escalan
  solos); si crece la carga, se replica `api` detrás de Traefik (stateless) y se
  atiende el cuello de botella real, que normalmente es la base de datos (réplicas
  de lectura / pooling de conexiones) y las notificaciones (worker separado).

### ADRs (decisiones de arquitectura)

- **Vite (SPA) en vez de Next.js**: hay un backend Nest dedicado, ambas apps están
  detrás de login (sin necesidad de SSR/SEO), y la app de la persona apunta a móvil
  a futuro (Capacitor/React Native) — Next añadiría un segundo tier de servidor sin
  aportar nada en este caso. Si más adelante se necesita una landing pública
  indexable, esa sí se construiría con Next como proyecto aparte (`apps/web`).
- **Docker + VPS propio en vez de plataforma gestionada**: para el tamaño actual del
  proyecto, un VPS con `docker-compose` es más barato y da control total, sin atarse
  a un proveedor. Las imágenes Docker hacen la migración a un servicio gestionado
  trivial si el crecimiento lo justifica más adelante.
