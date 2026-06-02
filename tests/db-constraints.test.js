/**
 * DB Constraints Test Suite
 *
 * Validates:
 *  - UNIQUE constraints on ciclos_escolares.nombre, grados.nombre, grados.orden, turnos.nombre
 *  - FK ON DELETE RESTRICT: cannot delete turno/grado/ciclo with grupos referencing it
 *  - Audit trigger writes a row to log_auditoria
 *
 * NOTE: these tests require a running PostgreSQL with migrations applied.
 * Run with: npm test
 * Use a dedicated DB (e.g., DB_NAME=controlescolar_test) to avoid corrupting prod data.
 */

const { sequelize, Ciclo, Grado, Turno, Grupo, LogAuditoria } = require('../models');

const isTestDb = (process.env.DB_NAME || '').toLowerCase().includes('test');

beforeAll(async () => {
  if (!isTestDb) {
    console.warn(
      '[db-constraints] DB_NAME does not contain "test" — skipping suite to protect data.'
    );
  }
  await sequelize.authenticate();
});

afterAll(async () => {
  await sequelize.close();
});

const skipIfNotTestDb = isTestDb ? describe : describe.skip;

skipIfNotTestDb('DB Constraints', () => {
  let cicloId, gradoId, turnoId, grupoId;

  beforeAll(async () => {
    // clean baseline
    await Grupo.destroy({ where: {}, truncate: { cascade: true } }).catch(() => {});
    await Turno.destroy({ where: {}, truncate: { cascade: true } }).catch(() => {});
    await Grado.destroy({ where: {}, truncate: { cascade: true } }).catch(() => {});
    await Ciclo.destroy({ where: {}, truncate: { cascade: true } }).catch(() => {});
  });

  test('UNIQUE: ciclos_escolares.nombre rechaza duplicados', async () => {
    const ciclo = await Ciclo.create({
      nombre: 'CICLO-2025-2026',
      fecha_inicio: '2025-08-01',
      fecha_fin: '2026-06-30',
      activo: true,
    });
    cicloId = ciclo.id;

    await expect(
      Ciclo.create({
        nombre: 'CICLO-2025-2026',
        fecha_inicio: '2026-08-01',
        fecha_fin: '2027-06-30',
      })
    ).rejects.toMatchObject({ name: 'SequelizeUniqueConstraintError' });
  });

  test('UNIQUE: grados.nombre y grados.orden rechazan duplicados', async () => {
    const grado = await Grado.create({ nombre: '1ro-test', nivel: 'Primaria', orden: 1001 });
    gradoId = grado.id;

    await expect(
      Grado.create({ nombre: '1ro-test', nivel: 'Primaria', orden: 1002 })
    ).rejects.toMatchObject({ name: 'SequelizeUniqueConstraintError' });

    await expect(
      Grado.create({ nombre: '2do-test', nivel: 'Primaria', orden: 1001 })
    ).rejects.toMatchObject({ name: 'SequelizeUniqueConstraintError' });
  });

  test('UNIQUE: turnos.nombre rechaza duplicados', async () => {
    const turno = await Turno.create({ nombre: 'Matutino-test', hora_inicio: '07:00:00', hora_fin: '13:00:00' });
    turnoId = turno.id;

    await expect(
      Turno.create({ nombre: 'Matutino-test', hora_inicio: '08:00:00', hora_fin: '14:00:00' })
    ).rejects.toMatchObject({ name: 'SequelizeUniqueConstraintError' });
  });

  test('FK: crear grupo referenciando ciclo/grado/turno valido funciona', async () => {
    const grupo = await Grupo.create({
      nombre: 'Grupo-test-A',
      grado: 1,
      seccion: 'A',
      capacidad: 30,
      ciclo_id: cicloId,
      grado_id: gradoId,
      turno_id: turnoId,
    });
    grupoId = grupo.id;
    expect(grupo.id).toBeDefined();
  });

  test('FK: insertar grupo con turno_id inexistente falla', async () => {
    await expect(
      Grupo.create({
        nombre: 'Grupo-test-B',
        grado: 1,
        seccion: 'B',
        ciclo_id: cicloId,
        grado_id: gradoId,
        turno_id: 999999,
      })
    ).rejects.toMatchObject({ name: 'SequelizeForeignKeyConstraintError' });
  });

  test('FK ON DELETE RESTRICT: no se puede eliminar turno con grupos asignados', async () => {
    await expect(Turno.destroy({ where: { id: turnoId } })).rejects.toMatchObject({
      name: 'SequelizeForeignKeyConstraintError',
    });
  });

  test('FK ON DELETE RESTRICT: no se puede eliminar grado con grupos asignados', async () => {
    await expect(Grado.destroy({ where: { id: gradoId } })).rejects.toMatchObject({
      name: 'SequelizeForeignKeyConstraintError',
    });
  });

  test('FK ON DELETE RESTRICT: no se puede eliminar ciclo con grupos asignados', async () => {
    await expect(Ciclo.destroy({ where: { id: cicloId } })).rejects.toMatchObject({
      name: 'SequelizeForeignKeyConstraintError',
    });
  });

  test('Audit trigger registra INSERT en log_auditoria', async () => {
    const before = await LogAuditoria.count({ where: { tabla: 'turnos', accion: 'INSERT' } });
    const turno = await Turno.create({ nombre: 'Vespertino-test', hora_inicio: '14:00:00', hora_fin: '20:00:00' });
    const after = await LogAuditoria.count({ where: { tabla: 'turnos', accion: 'INSERT' } });
    expect(after).toBe(before + 1);
    await Turno.destroy({ where: { id: turno.id } });
  });

  test('Audit trigger registra UPDATE y DELETE', async () => {
    const turno = await Turno.create({ nombre: 'TmpAudit-test', hora_inicio: '15:00:00', hora_fin: '21:00:00' });
    await turno.update({ hora_fin: '22:00:00' });
    await turno.destroy();
    const updates = await LogAuditoria.count({ where: { tabla: 'turnos', registro_id: String(turno.id), accion: 'UPDATE' } });
    const deletes = await LogAuditoria.count({ where: { tabla: 'turnos', registro_id: String(turno.id), accion: 'DELETE' } });
    expect(updates).toBeGreaterThanOrEqual(1);
    expect(deletes).toBeGreaterThanOrEqual(1);
  });

  afterAll(async () => {
    await Grupo.destroy({ where: { id: grupoId } }).catch(() => {});
    await Turno.destroy({ where: { id: turnoId } }).catch(() => {});
    await Grado.destroy({ where: { id: gradoId } }).catch(() => {});
    await Ciclo.destroy({ where: { id: cicloId } }).catch(() => {});
  });
});
