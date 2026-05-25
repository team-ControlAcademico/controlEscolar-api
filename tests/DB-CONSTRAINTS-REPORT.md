# DB Constraints Test Report

Suite: `tests/db-constraints.test.js`

## Pre-requisitos

1. PostgreSQL en ejecucion.
2. Variables de entorno apuntando a una base de pruebas:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=controlescolar_test
   DB_USER=postgres
   DB_PASS=postgres
   ```
   El nombre de la BD debe contener `test` o el suite se omite (proteccion contra correr sobre prod).
3. Migraciones aplicadas: `npm run migrate`.
4. Dependencias de testing: `npm i -D jest supertest`.

Ejecutar: `npm test`.

## Casos validados

| # | Caso | Resultado esperado |
|---|------|--------------------|
| 1 | INSERT ciclo con nombre duplicado | `SequelizeUniqueConstraintError` |
| 2 | INSERT grado con nombre duplicado | `SequelizeUniqueConstraintError` |
| 3 | INSERT grado con orden duplicado | `SequelizeUniqueConstraintError` |
| 4 | INSERT turno con nombre duplicado | `SequelizeUniqueConstraintError` |
| 5 | INSERT grupo con ciclo/grado/turno valido | OK |
| 6 | INSERT grupo con turno_id inexistente | `SequelizeForeignKeyConstraintError` |
| 7 | DELETE turno con grupo asignado | `SequelizeForeignKeyConstraintError` (RESTRICT) |
| 8 | DELETE grado con grupo asignado | `SequelizeForeignKeyConstraintError` (RESTRICT) |
| 9 | DELETE ciclo con grupo asignado | `SequelizeForeignKeyConstraintError` (RESTRICT) |
| 10 | INSERT registra log en `log_auditoria` | Conteo incrementa en +1 |
| 11 | UPDATE + DELETE registran log | Cada accion produce su log correspondiente |

## Resumen de restricciones DDL

- `ciclos_escolares.nombre` UNIQUE.
- `grados.nombre` UNIQUE, `grados.orden` UNIQUE.
- `turnos.nombre` UNIQUE.
- `grupos.ciclo_id`, `grupos.grado_id`, `grupos.turno_id`:
  - `REFERENCES ... ON UPDATE CASCADE ON DELETE RESTRICT`.
- `grupos (nombre, ciclo_id)` UNIQUE (no permite nombres repetidos dentro del mismo ciclo).

## Auditoria

- Tabla `log_auditoria` con columnas:
  `id, tabla, registro_id, accion, datos_anteriores (JSONB), datos_nuevos (JSONB), usuario_id, ip, created_at`.
- Funcion `fn_audit_trigger()` (`plpgsql`) y triggers `trg_audit_<tabla>` en:
  `users, alumnos, maestros, grupos, materias, calificaciones, ciclos_escolares, grados, turnos`.
- `usuario_id` se toma de `current_setting('app.current_user_id', true)`; el middleware `auth.js` la establece tras autenticar.
