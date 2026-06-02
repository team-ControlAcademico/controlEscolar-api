'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ciclos_escolares', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      fecha_inicio: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      fecha_fin: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('grados', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      nivel: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      orden: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('turnos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      hora_inicio: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      hora_fin: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addColumn('grupos', 'ciclo_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'ciclos_escolares', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    await queryInterface.addColumn('grupos', 'grado_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'grados', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    await queryInterface.addColumn('grupos', 'turno_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'turnos', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    await queryInterface.addConstraint('grupos', {
      fields: ['nombre', 'ciclo_id'],
      type: 'unique',
      name: 'grupos_nombre_ciclo_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('grupos', 'grupos_nombre_ciclo_unique').catch(() => {});
    await queryInterface.removeColumn('grupos', 'turno_id').catch(() => {});
    await queryInterface.removeColumn('grupos', 'grado_id').catch(() => {});
    await queryInterface.removeColumn('grupos', 'ciclo_id').catch(() => {});
    await queryInterface.dropTable('turnos');
    await queryInterface.dropTable('grados');
    await queryInterface.dropTable('ciclos_escolares');
  },
};
