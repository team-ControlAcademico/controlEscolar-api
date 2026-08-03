<div align="center">

# 🎓 Control Escolar — API

**Backend RESTful para el Sistema Integral de Control Escolar**

[![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Deploy](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render&logoColor=white)](https://render.com/)

---

*API robusta y segura que gestiona la lógica académica, financiera y de comunicación de una institución educativa.*

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Arquitectura](#-arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)
- [Módulos](#-módulos)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Variables de Entorno](#-variables-de-entorno)
- [Comandos Disponibles](#-comandos-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Autenticación y Seguridad](#-autenticación-y-seguridad)
- [Base de Datos](#-base-de-datos)
- [Despliegue](#-despliegue)

---

## 📝 Descripción

Este repositorio contiene el **servidor backend** del Sistema de Control Escolar, una API RESTful que alimenta toda la plataforma web. Está diseñado con una arquitectura por capas (Routes → Controllers → Services → Prisma ORM) que garantiza separación de responsabilidades, mantenibilidad y escalabilidad.

El backend gestiona:
- 🔐 Autenticación JWT con refresh tokens y recuperación de contraseña
- 👥 Gestión de usuarios con 6 roles diferenciados
- 📚 Administración académica completa (carreras, materias, grupos, horarios, calificaciones)
- 💰 Sistema financiero integral (colegiaturas, pagos, becas, facturación)
- 📨 Comunicación en tiempo real (avisos, mensajería con Socket.IO)

---

## 🏗 Arquitectura

```
Cliente (React)  ←→  API REST (Express)  ←→  PostgreSQL (Neon DB)
                          ↕
                     Socket.IO
                  (Tiempo Real)
```

### Patrón de Capas

```
📂 Routes        → Define las rutas HTTP y permisos por rol
📂 Controllers   → Recibe Request/Response, valida con Zod, delega al servicio
📂 Services      → Contiene la lógica de negocio pura y consultas Prisma
📂 Middlewares   → Autenticación JWT, autorización por rol, manejo de errores
📂 Schemas       → Validación de entrada con Zod (type-safe)
```

---

## ⚡ Stack Tecnológico

| Tecnología | Uso |
|---|---|
| **Node.js** | Entorno de ejecución del servidor |
| **Express.js** | Framework web minimalista para la API REST |
| **TypeScript** | Tipado estático en todo el código |
| **Prisma ORM** | Mapeo objeto-relacional con autocompletado y migraciones |
| **PostgreSQL** | Base de datos relacional (alojada en Neon DB) |
| **Zod** | Validación de datos de entrada en cada endpoint |
| **JWT** | Autenticación stateless con access/refresh tokens |
| **bcrypt** | Hashing seguro de contraseñas (12 rounds) |
| **Socket.IO** | Comunicación bidireccional en tiempo real |
| **Helmet** | Headers de seguridad HTTP |
| **pnpm** | Gestor de paquetes rápido y eficiente |

---

## 📦 Módulos

| Módulo | Descripción | Roles con Acceso |
|---|---|---|
| **Autenticación** | Login, registro, refresh tokens, recuperación de contraseña | Todos |
| **Usuarios** | CRUD de cuentas, asignación de roles, activar/desactivar | ADMIN, ESCOLAR |
| **Carreras** | Gestión de carreras universitarias | ADMIN, ESCOLAR |
| **Planes de Estudio** | Mallas curriculares con asignación de materias | ADMIN, ESCOLAR |
| **Materias** | Catálogo de asignaturas con claves y créditos | ADMIN, ESCOLAR |
| **Ciclos Escolares** | Periodos académicos (cuatrimestrales/semestrales) | ADMIN, ESCOLAR |
| **Grupos** | Creación de grupos, asignación de docentes | ADMIN, ESCOLAR, DOCENTE |
| **Inscripciones** | Inscripción de alumnos a grupos | ADMIN, ESCOLAR, ADMINISTRATIVO |
| **Asistencias** | Registro y consulta de asistencia | ADMIN, ESCOLAR, DOCENTE |
| **Calificaciones** | Captura y consulta de calificaciones, boletas | ADMIN, ESCOLAR, DOCENTE |
| **Colegiaturas** | Generación de cargos financieros | ADMIN, ADMINISTRATIVO |
| **Pagos** | Registro de pagos y simulación en línea | ADMIN, ADMINISTRATIVO, ALUMNO |
| **Becas** | Asignación de becas y descuentos | ADMIN, ADMINISTRATIVO |
| **Facturas** | Generación y cancelación de CFDI | ADMIN, ADMINISTRATIVO |
| **Estado de Cuenta** | Consulta de adeudos y movimientos | Todos |
| **Avisos** | Publicación de comunicados generales | Todos |
| **Mensajería** | Chat privado en tiempo real entre usuarios | Todos |
| **Portal BFF** | Dashboard agregado por rol (alumno/docente/padre) | ALUMNO, DOCENTE, PADRE |

---

## 📌 Requisitos

- **Node.js** v18 o superior
- **pnpm** v9 o superior (`npm install -g pnpm`)
- **PostgreSQL** (local o remoto — recomendado: [Neon](https://neon.tech/))

---

## 🚀 Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/team-ControlAcademico/controlEscolar-api.git
cd controlEscolar-api

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita el archivo .env con tus credenciales (ver sección abajo)

# 4. Generar el cliente Prisma
pnpm db:generate

# 5. Sincronizar el esquema con la base de datos
pnpm db:push

# 6. (Opcional) Poblar con datos de prueba
pnpm db:seed

# 7. Iniciar en modo desarrollo
pnpm dev
```

El servidor se levantará en `http://localhost:4000` 🎉

---

## 🔑 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos PostgreSQL
DATABASE_URL="postgresql://usuario:contraseña@host:5432/nombre_db?sslmode=require"

# JWT
JWT_SECRET="tu-secreto-jwt-seguro-de-al-menos-16-chars"
JWT_REFRESH_SECRET="tu-secreto-refresh-seguro-de-al-menos-16-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Servidor
PORT=4000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"

# Finanzas (Opcional)
FINANZAS_ENCRYPTION_KEY="clave-cifrado-finanzas-16-chars"
STRIPE_WEBHOOK_SECRET="whsec_tu_secreto_stripe"
IVA_RATE=0.16
```

---

## 🛠 Comandos Disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Inicia el servidor en modo desarrollo con hot-reload |
| `pnpm build` | Compila TypeScript a JavaScript (`dist/`) |
| `pnpm start` | Ejecuta el servidor compilado en producción |
| `pnpm db:generate` | Regenera el cliente Prisma |
| `pnpm db:push` | Sincroniza el esquema Prisma con la BD (sin migración) |
| `pnpm db:migrate <nombre>` | Crea una migración con nombre |
| `pnpm db:seed` | Ejecuta el archivo de semillas |
| `pnpm db:studio` | Abre Prisma Studio (GUI para la BD) |
| `pnpm db:reset` | Resetea la base de datos (⚠️ destructivo) |

---

## 📁 Estructura del Proyecto

```
controlEscolar-api/
├── prisma/
│   ├── schema.prisma         # Esquema de la base de datos
│   └── seed.ts               # Datos iniciales de prueba
├── src/
│   ├── config/
│   │   └── env.ts            # Validación de variables de entorno con Zod
│   ├── controllers/          # Controladores HTTP
│   │   ├── auth.controller.ts
│   │   ├── finanzas.controller.ts
│   │   ├── usuario.controller.ts
│   │   └── ...
│   ├── middlewares/
│   │   ├── auth.middleware.ts      # JWT authentication & role authorization
│   │   ├── error.middleware.ts     # Manejo centralizado de errores
│   │   └── rateLimit.middleware.ts # Protección contra fuerza bruta
│   ├── routes/               # Definición de rutas por módulo
│   │   ├── index.ts          # Router principal
│   │   ├── auth.routes.ts
│   │   ├── finanzas.routes.ts
│   │   ├── usuario.routes.ts
│   │   └── ...
│   ├── schemas/              # Esquemas de validación Zod
│   │   ├── auth.schema.ts
│   │   ├── finanzas.schema.ts
│   │   ├── usuario.schema.ts
│   │   └── ...
│   ├── services/             # Lógica de negocio y queries Prisma
│   │   ├── auth.service.ts
│   │   ├── portal.service.ts
│   │   ├── usuario.service.ts
│   │   └── ...
│   ├── utils/
│   │   └── jwt.ts            # Firma y verificación de tokens
│   └── index.ts              # Entry point del servidor
├── package.json
├── tsconfig.json
└── .env
```

---

## 🌐 Endpoints de la API

Todos los endpoints viven bajo el prefijo `/api`. Ejemplo: `GET /api/alumnos`.

<details>
<summary><strong>🔐 Autenticación</strong></summary>

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/register` | Registrar nuevo usuario |
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/refresh` | Renovar access token |
| GET | `/auth/profile` | Obtener perfil autenticado |
| POST | `/auth/logout` | Cerrar sesión |
| POST | `/auth/forgot-password` | Solicitar recuperación |
| POST | `/auth/reset-password` | Restablecer contraseña |

</details>

<details>
<summary><strong>👥 Usuarios</strong></summary>

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/usuarios` | Listar todos los usuarios |
| GET | `/usuarios/:id` | Obtener un usuario |
| POST | `/usuarios` | Crear usuario |
| PUT | `/usuarios/:id` | Actualizar usuario |
| DELETE | `/usuarios/:id` | Eliminar usuario |
| PATCH | `/usuarios/:id/toggle-activo` | Activar/desactivar cuenta |

</details>

<details>
<summary><strong>📚 Académico</strong></summary>

| Método | Ruta | Descripción |
|---|---|---|
| GET/POST | `/carreras` | Listar / Crear carreras |
| GET/POST | `/planes` | Listar / Crear planes de estudio |
| GET/POST | `/materias` | Listar / Crear materias |
| GET/POST | `/ciclos` | Listar / Crear ciclos escolares |
| GET/POST | `/grupos` | Listar / Crear grupos |
| GET/POST | `/inscripciones` | Listar / Crear inscripciones |
| GET/POST | `/asistencias` | Listar / Registrar asistencias |
| GET/POST | `/calificaciones` | Listar / Capturar calificaciones |

</details>

<details>
<summary><strong>💰 Finanzas</strong></summary>

| Método | Ruta | Descripción |
|---|---|---|
| GET/POST | `/finanzas/colegiaturas` | Gestión de colegiaturas |
| POST | `/finanzas/colegiaturas/generar` | Generar cargos masivos |
| GET/POST | `/finanzas/pagos` | Gestión de pagos |
| POST | `/finanzas/pagar-en-linea` | Pago simulado en línea (alumno) |
| GET/POST | `/finanzas/becas` | Gestión de becas |
| GET/POST | `/finanzas/facturas` | Gestión de facturas CFDI |
| GET | `/finanzas/mi-estado-cuenta` | Estado de cuenta del alumno |
| GET | `/finanzas/reportes` | Reportes financieros |

</details>

---

## 🔐 Autenticación y Seguridad

- **JWT (JSON Web Tokens):** Sistema stateless con tokens de acceso (15 min) y refresh tokens (7 días) almacenados en la BD.
- **bcrypt:** Contraseñas hasheadas con 12 rondas de salt.
- **RBAC:** Control de acceso basado en 6 roles: `ADMIN`, `ESCOLAR`, `ADMINISTRATIVO`, `DOCENTE`, `ALUMNO`, `PADRE`.
- **Helmet:** Headers HTTP de seguridad habilitados automáticamente.
- **Rate Limiting:** Protección contra ataques de fuerza bruta en login y recuperación de contraseña.
- **Zod Validation:** Todos los datos de entrada son validados antes de llegar a la lógica de negocio.

---

## 🗄 Base de Datos

El esquema incluye **18+ tablas** relacionales:

```
User ──┬── AdminProfile
       ├── EscolarProfile
       ├── AdministrativoProfile
       ├── DocenteProfile ──── Grupo ──── Horario
       ├── AlumnoProfile ──┬── Inscripcion
       │                   ├── Calificacion
       │                   ├── Asistencia
       │                   ├── Colegiatura ──── Pago
       │                   └── Beca
       └── PadreProfile

CicloEscolar ──── Grupo
Carrera ──── PlanEstudio ──── Materia
Aviso ──── AvisoLeido
Conversacion ──── Mensaje
```

---

## 🚢 Despliegue

El backend está desplegado en **[Render](https://render.com/)** con despliegue automático desde la rama `main`.

### Build Command:
```bash
pnpm install && npx prisma generate && pnpm run build
```

### Start Command:
```bash
pnpm start
```

---

<div align="center">

**Desarrollado con ❤️ por el equipo de Control Académico**

</div>
