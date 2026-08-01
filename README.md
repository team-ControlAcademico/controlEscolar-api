<div align="center">
  <h1>🎓 Control Escolar — Backend</h1>
  <p>API REST para el sistema de control escolar universitario</p>
</div>

---

## 📋 Requisitos

- [Docker](https://docs.docker.com/get-docker/) 20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) 2.0+

---

## 🚀 Inicio rápido

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd control-escolar-backend

# 2. Copiar variables de entorno (ajustar si es necesario)
cp .env.example .env

# 3. Levantar los servicios (PostgreSQL + API)
docker compose up -d

# 4. Esperar a que la BD esté healthy (~10 segundos)

# 5. Crear tablas en la base de datos
docker compose exec backend pnpm db:push

# 6. Poblar con datos de prueba
docker compose exec backend pnpm db:seed
```

---

## 🌐 URLs

| Servicio | URL |
|----------|-----|
| **Frontend (Web)** | `http://localhost:5173` |
| **API REST** | `http://localhost:4000/api` |
| **Base de datos** | `localhost:5433` |

> **Nota:** La ruta raíz `GET /api` no tiene handler y devuelve 404. Usa `GET /api/health` para verificar que la API está corriendo. Para ver todos los endpoints, consulta `ROUTES.md`.

---

## 🔐 Credenciales de prueba

> **No incluidas en el repositorio por seguridad.**
> Las credenciales se encuentran en `CREDENTIALS.md` (archivo excluido de git).
> Solicítalas al líder de proyecto o genera tus propios usuarios con `POST /api/auth/register`.
>
> Para desarrollo local, ejecuta `pnpm db:seed` que crea 6 usuarios de prueba (uno por rol).

---

## 📚 Endpoints

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `POST` | `/api/auth/refresh` | Renovar access token |
| `GET` | `/api/auth/profile` | Obtener perfil del usuario |
| `POST` | `/api/auth/logout` | Cerrar sesión |

### Sistema

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/health` | Health check del servidor |

---

## 🛠 Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `docker compose up -d` | Levantar servicios |
| `docker compose down` | Detener servicios |
| `docker compose logs backend -f` | Ver logs de la API |
| `docker compose exec backend pnpm db:push` | Sincronizar schema con BD |
| `docker compose exec backend pnpm db:seed` | Poblar datos de prueba |
| `docker compose exec backend pnpm db:reset` | Resetear BD completa |
| `docker compose exec backend pnpm db:studio` | Abrir Prisma Studio |

---

## 🧱 Tecnologías

| Categoría | Herramienta |
|-----------|-------------|
| Runtime | Node.js 22 |
| Framework | Express 4 |
| ORM | Prisma 6 |
| BD | PostgreSQL 16 |
| Auth | JWT + bcryptjs |
| Validación | Zod |
| Lenguaje | TypeScript 5 |

---

## 📁 Estructura

```
backend/
├── src/
│   ├── config/           # Configuración (env, DB)
│   ├── controllers/      # Controladores de cada módulo
│   ├── middlewares/      # Auth, roles, errores
│   ├── routes/           # Definición de rutas
│   ├── services/         # Lógica de negocio
│   ├── schemas/          # Validación Zod
│   ├── utils/            # Helpers (JWT, etc.)
│   └── types/            # Tipos TypeScript
├── prisma/
│   ├── schema.prisma     # Modelo de datos
│   └── seed.ts           # Datos iniciales
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## 🔒 Roles del sistema

| Rol | Descripción |
|-----|-------------|
| `ADMIN` | Superusuario, acceso total |
| `ESCOLAR` | Control escolar: inscripciones, kardex, calificaciones |
| `ADMINISTRATIVO` | Finanzas: pagos, facturación, becas |
| `DOCENTE` | Asistencia, calificaciones de sus grupos |
| `ALUMNO` | Consulta sus datos académicos |
| `PADRE` | Monitorea desempeño de su hijo |

## 👨‍💻 Desarrollo
Proyecto en desarrollo por el equipo de Control Académico
