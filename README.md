# Control Escolar API

Backend REST API para la plataforma de Control Escolar, construida con Node.js, Express y PostgreSQL.

## Requisitos

- Node.js >= 18.0.0
- PostgreSQL >= 12
- npm o yarn

## Instalacion

```bash
# Clonar repositorio
git clone https://github.com/team-ControlAcademico/controlEscolar-api.git
cd controlEscolar-api

# Instalar dependencias
npm install

# Configurar entorno
cp .env.example .env

# Configurar base de datos en .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=controlescolar
DB_USER=postgres
DB_PASS=tu_password

# Crear base de datos en PostgreSQL
createdb controlescolar

# Ejecutar migraciones
npm run migrate

# Ejecutar seeders (datos de prueba)
npm run seed

# Iniciar servidor de desarrollo
npm run dev
```

## Endpoints de Autenticacion

| Metodo | Endpoint              | Descripcion           |
|--------|----------------------|-----------------------|
| POST   | /api/auth/register   | Registrar usuario     |
| POST   | /api/auth/login      | Iniciar sesion        |
| POST   | /api/auth/logout     | Cerrar sesion (auth)  |
| GET    | /api/auth/me         | Obtener usuario (auth)|
| PUT    | /api/auth/me         | Actualizar perfil     |

## Endpoints de Recursos (requieren autenticacion Bearer Token)

### Alumnos
| Metodo | Endpoint                              | Descripcion                    |
|--------|--------------------------------------|--------------------------------|
| GET    | /api/alumnos                         | Listar alumnos (paginado)      |
| POST   | /api/alumnos                         | Crear alumno                   |
| GET    | /api/alumnos/:id                     | Ver alumno                     |
| PUT    | /api/alumnos/:id                     | Actualizar alumno              |
| DELETE | /api/alumnos/:id                     | Eliminar alumno                |
| GET    | /api/alumnos/:alumnoId/calificaciones| Calificaciones del alumno      |

### Maestros
| Metodo | Endpoint               | Descripcion           |
|--------|-----------------------|-----------------------|
| GET    | /api/maestros         | Listar maestros       |
| POST   | /api/maestros         | Crear maestro         |
| GET    | /api/maestros/:id     | Ver maestro           |
| PUT    | /api/maestros/:id     | Actualizar maestro    |
| DELETE | /api/maestros/:id     | Eliminar maestro      |

### Grupos
| Metodo | Endpoint              | Descripcion           |
|--------|----------------------|-----------------------|
| GET    | /api/grupos          | Listar grupos         |
| POST   | /api/grupos          | Crear grupo           |
| GET    | /api/grupos/:id      | Ver grupo             |
| PUT    | /api/grupos/:id      | Actualizar grupo      |
| DELETE | /api/grupos/:id      | Eliminar grupo        |

### Materias
| Metodo | Endpoint               | Descripcion         |
|--------|-----------------------|---------------------|
| GET    | /api/materias         | Listar materias     |
| POST   | /api/materias         | Crear materia       |
| GET    | /api/materias/:id     | Ver materia         |
| PUT    | /api/materias/:id     | Actualizar materia  |
| DELETE | /api/materias/:id     | Eliminar materia    |

### Calificaciones
| Metodo | Endpoint                     | Descripcion                |
|--------|-----------------------------|----------------------------|
| GET    | /api/calificaciones         | Listar calificaciones      |
| POST   | /api/calificaciones         | Crear calificacion         |
| GET    | /api/calificaciones/:id     | Ver calificacion           |
| PUT    | /api/calificaciones/:id     | Actualizar calificacion    |
| DELETE | /api/calificaciones/:id     | Eliminar calificacion      |

### Asistencias
| Metodo | Endpoint                     | Descripcion                 |
|--------|-----------------------------|-----------------------------|
| GET    | /api/asistencias            | Listar asistencias          |
| POST   | /api/asistencias            | Registrar asistencia        |
| GET    | /api/asistencias/:id        | Ver asistencia              |
| PUT    | /api/asistencias/:id        | Actualizar asistencia       |
| DELETE | /api/asistencias/:id        | Eliminar asistencia         |
| POST   | /api/asistencias/multiple   | Registrar multiples asistencias |

### Horarios
| Metodo | Endpoint               | Descripcion           |
|--------|-----------------------|-----------------------|
| GET    | /api/horarios         | Listar horarios       |
| POST   | /api/horarios         | Crear horario         |
| GET    | /api/horarios/:id     | Ver horario           |
| PUT    | /api/horarios/:id     | Actualizar horario    |
| DELETE | /api/horarios/:id     | Eliminar horario      |

### Padres
| Metodo | Endpoint               | Descripcion           |
|--------|-----------------------|-----------------------|
| GET    | /api/padres           | Listar padres         |
| POST   | /api/padres           | Crear padre           |
| GET    | /api/padres/:id       | Ver padre             |
| PUT    | /api/padres/:id       | Actualizar padre      |
| DELETE | /api/padres/:id       | Eliminar padre        |

### Dashboard
| Metodo | Endpoint                                  | Descripcion                    |
|--------|------------------------------------------|--------------------------------|
| GET    | /api/dashboard/stats                     | Estadisticas generales         |
| GET    | /api/dashboard/asistencia-hoy            | Resumen de asistencia del dia  |
| GET    | /api/dashboard/promedio-calificaciones   | Promedio de calificaciones     |

## Usuarios de Prueba (seeders)

| Rol     | Email                           | Password |
|---------|--------------------------------|----------|
| Admin   | admin@controlescolar.com       | password |
| Maestro | carlos.lopez@controlescolar.com| password |
| Alumno  | juan.perez@controlescolar.com  | password |
| Padre   | maria.lopez@controlescolar.com | password |

## Comandos

```bash
npm run dev          # Iniciar en modo desarrollo (con nodemon)
npm start            # Iniciar en produccion
npm run migrate      # Ejecutar migraciones
npm run migrate:undo # Revertir migraciones
npm run seed         # Ejecutar seeders
npm run seed:undo    # Revertir seeders
```

## Estructura del Proyecto

```
controlEscolar-api/
├── server.js              # Entry point
├── config/
│   ├── auth.js            # JWT configuration
│   ├── config.js          # Sequelize CLI config
│   └── database.js        # Database connection
├── models/                # Sequelize models (9)
├── migrations/            # Database migrations (10)
├── seeders/               # Database seeders
├── controllers/           # Route handlers (10)
├── routes/                # Express routes (11)
├── middleware/             # JWT auth + role middleware
├── validators/            # express-validator rules
└── utils/                 # Response helpers
```

## Licencia

MIT
