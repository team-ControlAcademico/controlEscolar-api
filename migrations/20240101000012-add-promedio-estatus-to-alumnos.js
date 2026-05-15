'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('alumnos', 'promedio', {
      type: Sequelize.DECIMAL(4, 2),
      defaultValue: 0,
    });
    await queryInterface.addColumn('alumnos', 'estatus', {
      type: Sequelize.ENUM('activo', 'inactivo', 'egresado'),
      defaultValue: 'activo',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('alumnos', 'estatus');
    await queryInterface.removeColumn('alumnos', 'promedio');
  },
};
