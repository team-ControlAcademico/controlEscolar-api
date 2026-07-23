# Plan de Desarrollo — Backend Control Escolar

> Plan de fases para el desarrollo del sistema de control escolar universitario.
> Formato: Markdown, compatible con GitHub, gestores de proyecto y documentación.

---

## Fase 1 — Infraestructura y Autenticación ✅ COMPLETADA

**Objetivo:** Base sólida del proyecto con Docker, base de datos y sistema de autenticación multirol.

### Tareas realizadas

- [x] Configuración de Docker (Dockerfile multi-stage + docker-compose.yml)
- [x] Configuración de TypeScript, Express, Prisma
- [x] Modelo de datos inicial: User, RefreshToken, 6 perfiles (Admin, Escolar, Administrativo, Docente, Alumno, Padre)
- [x] Sistema de autenticación JWT (access + refresh tokens)
- [x] Middleware de autenticación (`authenticate`) y autorización (`authorize(roles)`)
- [x] Validación de datos con Zod (register, login)
- [x] Hash de contraseñas con bcryptjs (salt rounds: 12)
- [x] Refresh token rotation
- [x] Seed con 6 usuarios de prueba (uno por rol)
- [x] Health check endpoint (`GET /api/health`)
- [x] CRUD de usuarios (register, login, profile, logout)
- [x] Variables de entorno validadas con Zod

### Tecnologías usadas

Node.js 22, Express 4, TypeScript 5, Prisma 6, PostgreSQL 16, JWT, bcryptjs, Zod, Docker

---

## Fase 2 — Gestión Académica ✅ COMPLETADA

**Objetivo:** Módulo central de administración académica: carreras, planes de estudio, materias, grupos y horarios.

### Modelos nuevos

| Modelo | Descripción |
|--------|-------------|
| Carrera | clave, nombre, descripcion, creditosTotales, duracionSemestres, activa |
| PlanEstudio | clave, nombre, carreraId, vigente |
| Materia | clave, nombre, creditos, tipo (OBLIGATORIA/OPTATIVA) |
| PlanMateria | planId, materiaId, semestre (intermedia) |
| Prerequisito | materiaId, prerequisitoId (auto-relación de Materia) |
| CicloEscolar | nombre, fechaInicio, fechaFin, tipo (CUATRIMESTRAL), activo |
| Grupo | clave, materiaId, cicloEscolarId, docenteId, aula, cupoMaximo |
| Inscripcion | alumnoId, grupoId, estatus (INSCRITO/BAJA/REPROBADO/APROBADO) |
| Horario | grupoId, dia (LUNES...VIERNES), horaInicio, horaFin, aula |

### API endpoints

- CRUD Carreras
- CRUD Planes de estudio (+ agregar/quitar materias)
- CRUD Materias (+ prerrequisitos)
- CRUD Ciclos escolares (+ activar/desactivar)
- CRUD Grupos (+ asignar docente, horario)
- CRUD Inscripciones (inscribir, dar de baja, listar por grupo/alumno)
- Alumnos: CRUD extendido + kardex preliminar

### Seguridad y robustez (rama `v2`)

- [x] **Recuperación de contraseña** (BACK-09): tokens temporales (1 h) con `forgot-password` / `reset-password`. Modelo `PasswordResetToken`. El correo se abstrae en `email.service.ts` (en dev se registra en consola). Al restablecer se revocan todas las sesiones activas.
- [x] **Rate limiter** (BACK-13): limitador global (300 req/15 min) + limitador estricto en endpoints de auth (10 req/15 min) contra fuerza bruta.
- [x] **Transacciones seguras en inscripción** (BACK-15): la validación de cupo y el alta se ejecutan en una transacción `Serializable`, evitando sobrecupo por condiciones de carrera (rollback automático).
- [ ] **Cola de trabajos / envío de correos asíncrono** (BACK-17): pendiente. Requiere infraestructura Redis + BullMQ. El `email.service.ts` ya está diseñado como punto de integración para un worker.

> **Nota de despliegue:** el modelo `PasswordResetToken` es nuevo. Ejecutar `pnpm db:push` (o `pnpm db:migrate <nombre>`) para reflejarlo en la base de datos.

### Roles con acceso

ADMIN y ESCOLAR para operaciones CRUD. ADMINISTRATIVO para consulta de inscripciones. DOCENTE ve sus grupos. ALUMNO ve solo sus datos.

---

## Fase 3 — Asistencia y Evaluación ✅ COMPLETADA

**Objetivo:** Control de asistencia diaria y sistema de calificaciones (escala 0-10).

### Modelos nuevos

| Modelo | Descripción |
|--------|-------------|
| Asistencia | alumnoId, grupoId, fecha, presente (booleano), justificacion |
| Calificacion | alumnoId, grupoId, unidad (1/2/3), calificacion (0-10), tipo (ORDINARIO/EXTRAORDINARIO/TITULO) |

### Funcionalidades

- Registro diario de asistencia por docente
- Reporte de inasistencias y alertas automáticas
- Captura de calificaciones por unidad
- Cálculo automático de promedios
- Generación de boletas de calificaciones
- Gestión de oportunidades (ordinario, extraordinario, título)

### Roles con acceso

DOCENTE captura asistencia y calificaciones de sus grupos. ALUMNO y PADRE consultan. ESCOLAR supervisa y valida.

---

## Fase 4 — Finanzas 💰 ✅ COMPLETADA

**Objetivo:** Módulo de cobranza, facturación y becas.

### Modelos nuevos

| Modelo | Descripción |
|--------|-------------|
| Colegiatura | alumnoId, cicloEscolarId, concepto, monto/descuento/recargo/total `Decimal(10,2)`, fechaVencimiento, estatus (PENDIENTE/PARCIAL/PAGADA/VENCIDA/CANCELADA) |
| Pago | colegiaturaId, alumnoId, monto, fecha, metodo (EFECTIVO/TRANSFERENCIA/TARJETA/STRIPE), referencia, estatus |
| Factura | pagoId, cfdiUuid, serie/folio, rfcReceptor, usoCfdi, subtotal/iva/total, xmlData (cifrado AES-256), cadenaOriginal, selloDigital (CFDI 4.0) |
| Beca | alumnoId, tipo (ACADEMICA/DEPORTIVA/CONVENIO/SOCIOECONOMICA), porcentaje, vigencia, activa |
| Descuento | concepto (único), tipo (PORCENTAJE/MONTO), valor, activo |

### Funcionalidades implementadas

- [x] **Modelos financieros** (BACK-27): montos con `Decimal(10,2)` para precisión exacta.
- [x] **Cargos automáticos** (BACK-28): `POST /finanzas/colegiaturas/generar` crea la colegiatura de todos los alumnos inscritos en un ciclo, aplicando su beca vigente como descuento. Idempotente. Un scheduler mensual solo necesita invocar este endpoint.
- [x] **API de transacciones / saldo en tiempo real** (BACK-29): el registro de pago valida saldo y actualiza el estatus de la colegiatura en una transacción `Serializable` (sin sobrepago por concurrencia).
- [x] **Webhooks de pago** (BACK-30): `POST /finanzas/webhooks/pago`, público, autenticado por firma HMAC-SHA256 (`STRIPE_WEBHOOK_SECRET`).
- [x] **Descuentos y recargos** (BACK-31): catálogo de descuentos + cálculo de total dinámico.
- [x] **Facturación CFDI 4.0** (BACK-32/33): emisión con subtotal/IVA desglosados. El timbrado ante el PAC/SAT está aislado en `factura.service.ts` (`timbrarConPAC`) como punto de integración; en dev genera UUID/cadena/sello simulados.
- [x] **Cifrado AES-256** (BACK-34): el XML del CFDI se guarda cifrado (`utils/crypto.ts`, AES-256-GCM).
- [x] Estado de cuenta por alumno y del alumno autenticado (`/mi-estado-cuenta`).
- [x] Reportes financieros: ingresos, cartera total, cartera vencida, alumnos con adeudo, desglose por ciclo.

> **Nota de despliegue:** hay 5 modelos nuevos. Ejecutar `pnpm db:push` (o `pnpm db:migrate <nombre>`) y `pnpm db:seed` para reflejarlos y poblar datos de ejemplo.

### Roles con acceso

ADMINISTRATIVO y ADMIN gestionan todo. ALUMNO y PADRE consultan su estado de cuenta.

---

## Fase 5 — Comunicación y Portales 📬

**Objetivo:** Portales diferenciados y sistema de mensajería interna.

### Funcionalidades

- Portal de alumno: calificaciones, horario, estado de cuenta
- Portal de docente: lista de asistencia, captura de notas, envío de avisos
- Portal de padre: acceso a datos de su(s) hijo(s)
- Módulo de mensajería interna entre roles
- Notificaciones push y correo electrónico (Nodemailer)

### Roles con acceso

Todos los roles, con vistas filtradas por permisos.

---

## Fase 6 — Certificación y Reportes 📜

**Objetivo:** Emisión de documentos oficiales y reportes avanzados.

### Funcionalidades

- Generación de historial académico (kardex) con sello digital
- Emisión de certificados parciales y totales
- Gestión de trámites de titulación
- Actas de evaluación y documentos oficiales SEP
- Dashboard con estadísticas generales
- Reportes personalizados por período, carrera, grupo

### Roles con acceso

ESCOLAR emite documentos. ADMIN supervisa. ALUMNO consulta y solicita.

---

## Stack del proyecto

| Categoría | Tecnología |
|-----------|------------|
| Runtime | Node.js 22 |
| Framework | Express 4 |
| ORM | Prisma 6 |
| BD | PostgreSQL 16 |
| Auth | JWT + bcryptjs |
| Validación | Zod |
| Lenguaje | TypeScript 5 |
| Contenedor | Docker + Compose |
| Package manager | pnpm 11 |
