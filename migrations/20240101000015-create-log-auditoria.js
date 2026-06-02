'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('log_auditoria', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      tabla: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      registro_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      accion: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      datos_anteriores: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      datos_nuevos: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      ip: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('log_auditoria', ['tabla']);
    await queryInterface.addIndex('log_auditoria', ['accion']);
    await queryInterface.addIndex('log_auditoria', ['created_at']);
    await queryInterface.addIndex('log_auditoria', ['usuario_id']);

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION fn_audit_trigger()
      RETURNS TRIGGER AS $$
      DECLARE
        v_user_id INTEGER;
        v_record_id TEXT;
      BEGIN
        BEGIN
          v_user_id := NULLIF(current_setting('app.current_user_id', true), '')::INTEGER;
        EXCEPTION WHEN OTHERS THEN
          v_user_id := NULL;
        END;

        IF (TG_OP = 'DELETE') THEN
          v_record_id := COALESCE(OLD.id::TEXT, NULL);
          INSERT INTO log_auditoria (tabla, registro_id, accion, datos_anteriores, datos_nuevos, usuario_id, created_at)
          VALUES (TG_TABLE_NAME, v_record_id, 'DELETE', row_to_json(OLD)::JSONB, NULL, v_user_id, CURRENT_TIMESTAMP);
          RETURN OLD;
        ELSIF (TG_OP = 'UPDATE') THEN
          v_record_id := COALESCE(NEW.id::TEXT, NULL);
          INSERT INTO log_auditoria (tabla, registro_id, accion, datos_anteriores, datos_nuevos, usuario_id, created_at)
          VALUES (TG_TABLE_NAME, v_record_id, 'UPDATE', row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB, v_user_id, CURRENT_TIMESTAMP);
          RETURN NEW;
        ELSIF (TG_OP = 'INSERT') THEN
          v_record_id := COALESCE(NEW.id::TEXT, NULL);
          INSERT INTO log_auditoria (tabla, registro_id, accion, datos_anteriores, datos_nuevos, usuario_id, created_at)
          VALUES (TG_TABLE_NAME, v_record_id, 'INSERT', NULL, row_to_json(NEW)::JSONB, v_user_id, CURRENT_TIMESTAMP);
          RETURN NEW;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    const auditedTables = [
      'users',
      'alumnos',
      'maestros',
      'grupos',
      'materias',
      'calificaciones',
      'ciclos_escolares',
      'grados',
      'turnos',
    ];

    for (const table of auditedTables) {
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS trg_audit_${table} ON ${table};
        CREATE TRIGGER trg_audit_${table}
        AFTER INSERT OR UPDATE OR DELETE ON ${table}
        FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
      `);
    }
  },

  async down(queryInterface) {
    const auditedTables = [
      'users',
      'alumnos',
      'maestros',
      'grupos',
      'materias',
      'calificaciones',
      'ciclos_escolares',
      'grados',
      'turnos',
    ];
    for (const table of auditedTables) {
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS trg_audit_${table} ON ${table};`);
    }
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS fn_audit_trigger();');
    await queryInterface.dropTable('log_auditoria');
  },
};
