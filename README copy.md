 Resumen

  1. Migraciones nuevas (migrations/):
  - 20240101000014-create-catalogos.js — crea ciclos_escolares, grados, turnos con UNIQUE en nombre/orden y agrega FKs
  ciclo_id/grado_id/turno_id a grupos con ON DELETE RESTRICT, además del UNIQUE compuesto (nombre, ciclo_id).
  - 20240101000015-create-log-auditoria.js — tabla log_auditoria (JSONB de datos), función fn_audit_trigger() y triggers AFTER
  INSERT/UPDATE/DELETE en 9 tablas críticas.

  2. Modelos (models/):
  - Ciclo.js, Grado.js, Turno.js, LogAuditoria.js.
  - models/index.js agrega asociaciones Ciclo/Grado/Turno → Grupo.
  - models/Grupo.js añade ciclo_id, grado_id, turno_id.

  3. Utilidades globales (utils/):
  - 20240101000015-create-log-auditoria.js — tabla log_auditoria (JSONB de datos), función fn_audit_trigger() y triggers
  AFTER INSERT/UPDATE/DELETE en 9 tablas críticas.

  2. Modelos (models/):
  - Ciclo.js, Grado.js, Turno.js, LogAuditoria.js.
  - models/index.js agrega asociaciones Ciclo/Grado/Turno → Grupo.
  - models/Grupo.js añade ciclo_id, grado_id, turno_id.

  3. Utilidades globales (utils/):
  - queryHelper.js — buildQuery() unifica paginación, búsqueda iLike, filtros y orden.
  - response.js — respuestas estandarizadas con success, paginated, conflict, handleSequelizeError (mapea errores Sequelize
   → 409/422).

  4. CRUDs catálogos:
  - Controladores: cicloController.js, gradoController.js, turnoController.js (GET/POST/PUT/DELETE).
  - Validators: cicloValidator.js, gradoValidator.js, turnoValidator.js.
  - Rutas: cicloRoutes.js, gradoRoutes.js, turnoRoutes.js registradas en /api/ciclos, /api/grados, /api/turnos.
  - grupoController.index migrado a buildQuery + relaciones nuevas.

  5. Auditoría:
  - middleware/auth.js ahora establece app.current_user_id por sesión para que los triggers capturen usuario_id.
  - controllers/auditoriaController.js + routes/auditoriaRoutes.js (GET /api/auditoria).

  6. Swagger (config/swagger.js + server.js): UI en /api/docs, JSON en /api/docs.json. JSDoc en todas las rutas nuevas.
  Dependencias swagger-jsdoc y swagger-ui-express agregadas a package.json.

  7. Tests de constraints (tests/db-constraints.test.js + tests/DB-CONSTRAINTS-REPORT.md): 11 casos (UNIQUE, FK
  inexistente, RESTRICT en delete con grupos asignados — incluye el ejemplo "no se puede eliminar turno con grupos
  asignados", y validación del trigger de auditoría). El suite se auto-omite si DB_NAME no contiene "test" para proteger
  datos. jest/supertest añadidos a devDependencies.

