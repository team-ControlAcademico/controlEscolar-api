# Rutas y URLs — Control Escolar

> Si eres nuevo en el proyecto, aquí encuentras todas las URLs de acceso y las rutas disponibles.

---

## URLs de acceso

| Servicio | URL | Puerto |
|----------|-----|--------|
| **Frontend (Web)** | `http://localhost:5173` | 5173 |
| **API (Backend)** | `http://localhost:4000/api` | 4000 |
| **Base de datos** | `localhost:5433` | 5433 |

> **Nota:** La ruta raíz `GET /api` **no tiene handler** y devuelve 404. Para verificar que la API funciona, usa `GET /api/health`. Todos los endpoints requieren un path específico después de `/api`.

> Las credenciales de prueba están en `CREDENTIALS.md`.
> 
> Para levantar el proyecto: `docker compose up -d` dentro de cada carpeta (`controlEscolar-api/` y `controlEscolar-web/`). El backend debe levantarse primero. Después ejecuta `docker compose exec backend pnpm db:push` y `docker compose exec backend pnpm db:seed` para inicializar la base de datos.

---

## API REST — Endpoints

**Base:** `http://localhost:4000/api`

### Health

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/health` | Pública | Estado del servidor |

### Auth

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Pública | Registrar nuevo usuario |
| POST | `/api/auth/login` | Pública | Iniciar sesión. Retorna `{ user, accessToken, refreshToken }` |
| POST | `/api/auth/refresh` | Pública | Renovar access token |
| GET | `/api/auth/profile` | Token | Perfil del usuario autenticado |
| POST | `/api/auth/logout` | Token | Cerrar sesión |

### Alumnos

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| GET | `/api/alumnos` | Token | ADMIN, ESCOLAR, ADMINISTRATIVO | Listar todos los alumnos |
| GET | `/api/alumnos/:id` | Token | ADMIN, ESCOLAR, ALUMNO | Detalle de un alumno (carrera, grupos, horarios) |

### Docentes

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| GET | `/api/docentes` | Token | ADMIN, ESCOLAR | Listar todos los docentes |

### Carreras

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| GET | `/api/carreras` | Token | ADMIN, ESCOLAR | Listar carreras |
| GET | `/api/carreras/:id` | Token | ADMIN, ESCOLAR | Detalle de carrera |
| POST | `/api/carreras` | Token | ADMIN, ESCOLAR | Crear carrera |
| PUT | `/api/carreras/:id` | Token | ADMIN, ESCOLAR | Editar carrera |
| DELETE | `/api/carreras/:id` | Token | ADMIN, ESCOLAR | Eliminar carrera |

### Planes de Estudio

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| GET | `/api/planes` | Token | ADMIN, ESCOLAR | Listar planes |
| GET | `/api/planes/:id` | Token | ADMIN, ESCOLAR | Detalle de plan |
| POST | `/api/planes` | Token | ADMIN, ESCOLAR | Crear plan |
| PUT | `/api/planes/:id` | Token | ADMIN, ESCOLAR | Editar plan |
| DELETE | `/api/planes/:id` | Token | ADMIN, ESCOLAR | Eliminar plan |
| POST | `/api/planes/:id/materias` | Token | ADMIN, ESCOLAR | Agregar materia a un plan (body: `{ materiaId, semestre }`) |
| DELETE | `/api/planes/:id/materias/:materiaId` | Token | ADMIN, ESCOLAR | Quitar materia de un plan |

### Materias

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| GET | `/api/materias` | Token | ADMIN, ESCOLAR | Listar materias |
| GET | `/api/materias/:id` | Token | ADMIN, ESCOLAR | Detalle de materia |
| POST | `/api/materias` | Token | ADMIN, ESCOLAR | Crear materia |
| PUT | `/api/materias/:id` | Token | ADMIN, ESCOLAR | Editar materia |
| DELETE | `/api/materias/:id` | Token | ADMIN, ESCOLAR | Eliminar materia |
| POST | `/api/materias/:id/prerequisitos` | Token | ADMIN, ESCOLAR | Agregar prerequisito (body: `{ prerequisitoId }`) |
| DELETE | `/api/materias/:id/prerequisitos/:prerequisitoId` | Token | ADMIN, ESCOLAR | Quitar prerequisito |

### Ciclos Escolares

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| GET | `/api/ciclos` | Token | ADMIN, ESCOLAR | Listar ciclos |
| GET | `/api/ciclos/:id` | Token | ADMIN, ESCOLAR | Detalle de ciclo |
| POST | `/api/ciclos` | Token | ADMIN, ESCOLAR | Crear ciclo |
| PUT | `/api/ciclos/:id` | Token | ADMIN, ESCOLAR | Editar ciclo |
| DELETE | `/api/ciclos/:id` | Token | ADMIN, ESCOLAR | Eliminar ciclo |
| PATCH | `/api/ciclos/:id/toggle-activo` | Token | ADMIN, ESCOLAR | Activar/desactivar ciclo |

### Grupos

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| GET | `/api/grupos` | Token | ADMIN, ESCOLAR, DOCENTE | Listar grupos. Filtros: `?cicloId=&docenteId=` |
| GET | `/api/grupos/:id` | Token | ADMIN, ESCOLAR, DOCENTE | Detalle de grupo |
| POST | `/api/grupos` | Token | ADMIN, ESCOLAR | Crear grupo |
| PUT | `/api/grupos/:id` | Token | ADMIN, ESCOLAR | Editar grupo |
| DELETE | `/api/grupos/:id` | Token | ADMIN, ESCOLAR | Eliminar grupo |
| POST | `/api/grupos/:id/horarios` | Token | ADMIN, ESCOLAR | Agregar horario a un grupo |
| DELETE | `/api/grupos/:id/horarios/:horarioId` | Token | ADMIN, ESCOLAR | Quitar horario de un grupo |

### Inscripciones

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| GET | `/api/inscripciones` | Token | ADMIN, ESCOLAR, ADMINISTRATIVO, ALUMNO | Listar inscripciones. Filtros: `?grupoId=&alumnoId=` |
| GET | `/api/inscripciones/:id` | Token | ADMIN, ESCOLAR, ADMINISTRATIVO, ALUMNO | Detalle de inscripción |
| POST | `/api/inscripciones` | Token | ADMIN, ESCOLAR, ADMINISTRATIVO | Inscribir alumno en grupo |
| PATCH | `/api/inscripciones/:id/estatus` | Token | ADMIN, ESCOLAR | Cambiar estatus de inscripción |
| DELETE | `/api/inscripciones/:id` | Token | ADMIN, ESCOLAR | Dar de baja inscripción |

> **Total: 46 endpoints** | Auth: Token = requiere JWT en header `Authorization: Bearer <token>`

---

## Frontend — Páginas

**Base:** `http://localhost:5173`

### Públicas (sin sesión)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/login` | LoginPage | Formulario de inicio de sesión (email + contraseña) |
| `/register` | RegisterPage | Formulario de registro con campos dinámicos según rol |

### Autenticadas (todos los roles)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | DashboardPage | Panel principal con info de usuario, rol y fase del proyecto |

### Administrador y Control Escolar

| Ruta | Componente | Roles | Descripción |
|------|------------|-------|-------------|
| `/carreras` | CarrerasPage | ADMIN, ESCOLAR | Listar, crear, editar y eliminar carreras |
| `/planes` | PlanesPage | ADMIN, ESCOLAR | Listar y crear planes de estudio |
| `/planes/:id` | PlanDetallePage | ADMIN, ESCOLAR | Detalle de plan con materias agrupadas por semestre |
| `/materias` | MateriasPage | ADMIN, ESCOLAR | Listar, crear y eliminar materias |
| `/ciclos` | CiclosPage | ADMIN, ESCOLAR | Listar, crear, activar/desactivar y eliminar ciclos |

### Admin, Control Escolar y Docente

| Ruta | Componente | Roles | Descripción |
|------|------------|-------|-------------|
| `/grupos` | GruposPage | ADMIN, ESCOLAR, DOCENTE | Listar, crear y eliminar grupos |

### Admin, Control Escolar y Administrativo

| Ruta | Componente | Roles | Descripción |
|------|------------|-------|-------------|
| `/inscripciones` | InscripcionesPage | ADMIN, ESCOLAR, ADMINISTRATIVO | Inscribir alumnos, dar de baja, cambiar estatus |

### Alumno

| Ruta | Componente | Roles | Descripción |
|------|------------|-------|-------------|
| `/mi-horario` | MiHorarioPage | ALUMNO | Ver grupos inscritos con horarios y aula |

> **Total: 12 rutas** | La ruta `*` (404) redirige al dashboard `/`.
