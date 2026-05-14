# AGENTS.md — controlEscolar-api

## Project overview

Node.js/Express REST API backend for a school control platform ("Control Escolar").

- **Frontend lives in a separate repo** — this repo is API-only. Do not add frontend code (JS/HTML/CSS).
- Remote: `https://github.com/team-ControlAcademico/controlEscolar-api.git`
- Team org: `team-ControlAcademico`

## Stack

- **Runtime:** Node.js >= 18
- **Framework:** Express.js
- **ORM:** Sequelize
- **Database:** PostgreSQL
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **Validation:** express-validator

## Dev commands

```bash
npm install            # install dependencies
npm run dev            # start dev server with nodemon (port 3000)
npm start              # start production server
npm run migrate        # run Sequelize migrations
npm run migrate:undo   # rollback all migrations
npm run seed           # seed database with test data
npm run seed:undo      # rollback seeders
```

**No PHP/Composer available.** This project is pure Node.js.

## Branching

- `main` — production-ready. Never commit directly.
- Feature branches follow `<name>-<topic>` pattern (e.g. `jhony-keb`).

## Architecture

```
server.js              # Entry point, Express setup
config/                # database.js (Sequelize), auth.js (JWT), config.js (CLI)
models/                # 9 Sequelize models + index.js (associations)
migrations/            # 10 migration files (15 tables)
controllers/           # 10 controllers (business logic)
routes/                # 11 route files + index.js (aggregator)
middleware/            # auth.js (JWT verify), role.js (role check)
validators/            # express-validator rules per resource + index.js
utils/                 # response.js (standardized JSON helpers)
seeders/               # seed.js (standalone script)
```

## Key domain models

User, Alumno, Maestro, Grupo, Materia, Calificacion, Asistencia, Horario, Padre

## Conventions

- All routes prefixed with `/api`
- Use validators from `validators/` with `validate` middleware before controllers
- Use response helpers from `utils/response.js` (success, created, notFound, paginated, error)
- Pagination: `?page=1&limit=15` on all index endpoints
- Search: `?search=term` on alumnos, maestros, materias, padres
- Auth: Bearer token in Authorization header
- Sequelize models use snake_case for DB columns, camelCase for JS

## Environment

Copy `.env.example` to `.env`. Key vars:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` (PostgreSQL)
- `JWT_SECRET`, `JWT_EXPIRY` (auth)
- `FRONTEND_URL` (CORS origin, default `http://localhost:3000`)
