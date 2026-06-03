# AGENTS.md — Backend Control Escolar

> **Este archivo lo leen automáticamente:** Claude Code, Antigravity CLI, OpenCode, Cursor, y cualquier agente de IA compatible con el estándar `AGENTS.md`.
>
> Mantenlo actualizado. La IA se basa en él para entender el proyecto.

---

## Estado del proyecto

| Fase | Estado | Descripción |
|------|--------|-------------|
| 1 | ✅ COMPLETADA | Infraestructura + autenticación multirol |
| 2 | ✅ COMPLETADA | Gestión académica (carreras, planes, materias, grupos) |
| 3 | 🔜 PRÓXIMA | Asistencia y evaluación |
| 4 | ⏳ PENDIENTE | Finanzas (colegiaturas, pagos, CFDI 4.0) |
| 5 | ⏳ PENDIENTE | Comunicación y portales |
| 6 | ⏳ PENDIENTE | Certificación y reportes |

> El roadmap detallado con modelos, endpoints y tareas por fase está en **`PLAN.md`**. Consúltalo antes de empezar cualquier feature.

### Lo que YA funciona (Fase 1 + 2)

- [x] Docker: `docker compose up -d` levanta PostgreSQL + API con hot-reload
- [x] Autenticación: register, login, refresh token, logout, profile
- [x] 6 roles: ADMIN, ESCOLAR, ADMINISTRATIVO, DOCENTE, ALUMNO, PADRE
- [x] JWT con access tokens (15 min) + refresh tokens (7 días) + rotation
- [x] Middleware `authenticate` + `authorize(roles)`
- [x] Validación Zod en todos los endpoints
- [x] Hash de contraseñas con bcryptjs (salt rounds 12)
- [x] Seed con usuarios, carreras, materias, planes, ciclos, grupos, horarios, inscripciones
- [x] Health check (`GET /api/health`)
- [x] CRUD Carreras (`/api/carreras`)
- [x] CRUD Planes de estudio + agregar/quitar materias (`/api/planes`)
- [x] CRUD Materias + prerequisitos (`/api/materias`)
- [x] CRUD Ciclos escolares + toggle activo (`/api/ciclos`)
- [x] CRUD Grupos + horarios (`/api/grupos`)
- [x] Inscripciones (inscribir, cambiar estatus, dar de baja) (`/api/inscripciones`)
- [x] Listar alumnos (`/api/alumnos`)
- [x] Listar docentes (`/api/docentes`)

### Lo que NO funciona todavía

- [ ] Control de asistencia y reportes de inasistencias
- [ ] Captura y cálculo de calificaciones (0-10)
- [ ] Boletas y generación de promedios
- [ ] Nada de finanzas, cobranza, ni facturación
- [ ] Nada de mensajería ni portales
- [ ] Nada de certificación ni reportes

### Lo que NUNCA debes hacer

- ❌ NO hardcodear secretos, credenciales, URLs de BD
- ❌ NO cambiar `.env` — solo `.env.example` como referencia
- ❌ NO tocar `CREDENTIALS.md` ni subirlo a git (está en `.gitignore`)
- ❌ NO crear archivos en la raíz de `control-escolar/` (es solo un contenedor de los 2 repos)
- ❌ NO usar `npm` — solo `pnpm`
- ❌ NO exponer el schema de Prisma ni credenciales en logs o respuestas HTTP

---

## Contexto del proyecto

API REST para un sistema de control escolar universitario. La aplicación gestiona el ciclo de vida académico completo: admisiones, planes de estudio, asistencia, calificaciones, finanzas y certificación. El frontend está en un repositorio separado (`control-escolar-frontend`) y se comunica con este backend vía HTTP (JSON).

## Stack

- **Runtime:** Node.js 22 con TypeScript 5
- **Framework:** Express 4
- **ORM:** Prisma 6 con PostgreSQL 16
- **Auth:** JWT (access + refresh tokens) con bcryptjs
- **Validación:** Zod (schemas en backend, el frontend no comparte schemas)

## Cómo levantar el proyecto

```bash
docker compose up -d                                        # Levantar PostgreSQL + API
docker compose exec backend pnpm db:push                    # Sincronizar schema
docker compose exec backend pnpm db:seed                    # Datos de prueba
docker compose exec backend pnpm db:reset                   # Resetear BD
docker compose down                                         # Detener servicios
```

## Estructura de código

```
src/
├── config/        → Variables de entorno validadas con Zod (env.ts)
├── controllers/   → Manejan request/response, llaman al service
├── middlewares/    → Autenticación (JWT), autorización (roles), manejo de errores
├── routes/        → Definición de endpoints, agrupados por módulo
├── services/      → Lógica de negocio, acceso a BD con Prisma
├── schemas/       → Schemas de validación Zod para request bodies
├── utils/         → Helpers (JWT, formateo, etc.)
├── types/         → Interfaces TypeScript compartidas
├── app.ts         → Configuración de Express (cors, helmet, json, rutas, error handler)
└── index.ts       → Entry point, carga dotenv, inicia el servidor
```

## Convenciones de código

- **Idioma del código:** español para mensajes de error/éxito al usuario, inglés para nombres de variables, funciones y archivos
- **Nombrado de archivos:** `kebab-case.ts` para archivos, `camelCase` para funciones y variables
- **Controllers:** reciben `Request` (o `AuthRequest`), delegan al service, devuelven JSON
- **Services:** funciones puras que reciben datos tipados y devuelven promesas. Manejan lógica de negocio y acceso a Prisma
- **Errores:** usar `AppError(message, statusCode)` para errores controlados. El `errorHandler` middleware los captura y formatea
- **Rutas:** agrupadas por módulo en `src/routes/`. Cada archivo exporta un `Router`
- **Schemas Zod:** NUNCA exportar inferencias de schemas — los tipos están en `src/types/`
- **Prisma:** importar `PrismaClient` desde `@prisma/client`. No hacer imports relativos del cliente generado

## Reglas de seguridad

- NUNCA hardcodear secretos, URLs de BD, o credenciales
- Usar `env.ts` que valida todas las variables con Zod al iniciar
- Las contraseñas se hashean con bcryptjs (salt rounds: 12) antes de guardarse
- Los tokens JWT tienen expiración configurable vía variables de entorno
- Las rutas protegidas usan el middleware `authenticate` y opcionalmente `authorize(roles)`
- CORS configurado para aceptar solo `FRONTEND_URL`

## Roles del sistema

| Rol | Descripción |
|-----|-------------|
| ADMIN | Superusuario, acceso total |
| ESCOLAR | Control escolar: inscripciones, kardex, calificaciones, certificados |
| ADMINISTRATIVO | Finanzas: colegiaturas, pagos, facturación, becas |
| DOCENTE | Asistencia, calificaciones de sus grupos, avisos |
| ALUMNO | Consulta sus datos académicos y estado de cuenta |
| PADRE | Monitorea desempeño académico de su hijo |

## Middleware de autorización

```typescript
// Proteger ruta para uno o más roles específicos
router.get("/admin-only", authenticate, authorize("ADMIN"), handler);

// Proteger ruta para múltiples roles
router.get("/academico", authenticate, authorize("ADMIN", "ESCOLAR"), handler);
```

## Relación con el frontend

- El frontend envía requests a `FRONTEND_URL` via CORS
- La API espera JSON con `Content-Type: application/json`
- Los errores de validación se devuelven como 400 con `{ message, errors: [{ field, message }] }`
- Los endpoints de auth devuelven `{ user, accessToken, refreshToken }` en login y refresh

## Prisma — comandos

```bash
pnpm db:push      # Sincroniza schema sin migraciones (dev)
pnpm db:migrate   # Crea migración (usar solo para versiones estables)
pnpm db:seed      # Ejecuta prisma/seed.ts (SOLO DESARROLLO)
pnpm db:reset     # Borra todo y recrea con seed
pnpm db:generate  # Regenera el cliente de Prisma
pnpm db:studio    # Abre Prisma Studio en el navegador
```

## Al crear nuevos módulos

1. Definir/actualizar el modelo en `prisma/schema.prisma`
2. Crear schema de validación Zod en `src/schemas/`
3. Crear service en `src/services/` (lógica de negocio)
4. Crear controller en `src/controllers/` (request/response)
5. Agregar rutas en un nuevo archivo en `src/routes/`
6. Registrar las rutas en `src/routes/index.ts`
7. Ejecutar `pnpm db:push` para sincronizar la BD

## URLs de acceso y primeros pasos

Cuando levantas el proyecto con Docker, los servicios quedan en:

| Servicio | URL | Nota |
|----------|-----|------|
| **API (Backend)** | `http://localhost:4000/api` | La ruta raíz `/api` no tiene handler, usa `/api/health` para verificar |
| **Frontend (Web)** | `http://localhost:5173` | Requiere que el backend esté corriendo |
| **Base de datos** | `localhost:5433` | PostgreSQL 16, usuario `postgres`, password `postgres`, DB `control_escolar` |

1. Levantar backend primero: `cd controlEscolar-api && docker compose up -d`
2. Inicializar BD: `docker compose exec backend pnpm db:push && docker compose exec backend pnpm db:seed`
3. Levantar frontend: `cd controlEscolar-web && docker compose up -d`
4. Abrir el navegador en `http://localhost:5173` e iniciar sesión con las credenciales en `CREDENTIALS.md`

> Para ver todas las rutas disponibles de la API y del frontend, consulta **`ROUTES.md`**.
> Para ver las credenciales de prueba (emails y contraseñas por rol), consulta **`CREDENTIALS.md`**.

## Archivos de documentación

| Archivo | Propósito | En git? |
|---------|-----------|---------|
| `AGENTS.md` | Instrucciones para IA (este archivo) | ✅ Sí |
| `README.md` | Documentación para humanos | ✅ Sí |
| `PLAN.md` | Roadmap completo por fases | ✅ Sí |
| `ROUTES.md` | Todas las URLs y rutas de la API y frontend | ✅ Sí |
| `CREDENTIALS.md` | Credenciales de prueba por rol | ❌ No (gitignored) |
| `.env` | Variables de entorno locales | ❌ No (gitignored) |
| `.env.example` | Template de variables de entorno | ✅ Sí |
