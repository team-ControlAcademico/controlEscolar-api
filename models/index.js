const { sequelize } = require('../config/database');
const User = require('./User');
const Alumno = require('./Alumno');
const Maestro = require('./Maestro');
const Grupo = require('./Grupo');
const Materia = require('./Materia');
const Calificacion = require('./Calificacion');
const Asistencia = require('./Asistencia');
const Horario = require('./Horario');
const Padre = require('./Padre');
const Ciclo = require('./Ciclo');
const Grado = require('./Grado');
const Turno = require('./Turno');
const LogAuditoria = require('./LogAuditoria');

Ciclo.hasMany(Grupo, { foreignKey: 'ciclo_id', as: 'grupos' });
Grupo.belongsTo(Ciclo, { foreignKey: 'ciclo_id', as: 'ciclo' });

Grado.hasMany(Grupo, { foreignKey: 'grado_id', as: 'grupos' });
Grupo.belongsTo(Grado, { foreignKey: 'grado_id', as: 'gradoRef' });

Turno.hasMany(Grupo, { foreignKey: 'turno_id', as: 'grupos' });
Grupo.belongsTo(Turno, { foreignKey: 'turno_id', as: 'turno' });

User.hasOne(Alumno, { foreignKey: 'user_id', as: 'alumno' });
Alumno.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(Maestro, { foreignKey: 'user_id', as: 'maestro' });
Maestro.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(Padre, { foreignKey: 'user_id', as: 'padre' });
Padre.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Padre.hasMany(Alumno, { foreignKey: 'padre_id', as: 'alumnos' });
Alumno.belongsTo(Padre, { foreignKey: 'padre_id', as: 'padre' });

Grupo.hasMany(Alumno, { foreignKey: 'grupo_id', as: 'alumnos' });
Alumno.belongsTo(Grupo, { foreignKey: 'grupo_id', as: 'grupo' });

Maestro.belongsToMany(Materia, { through: 'maestro_materia', foreignKey: 'maestro_id', as: 'materias' });
Materia.belongsToMany(Maestro, { through: 'maestro_materia', foreignKey: 'materia_id', as: 'maestros' });

Grupo.belongsToMany(Materia, { through: 'grupo_materia', foreignKey: 'grupo_id', as: 'materias' });
Materia.belongsToMany(Grupo, { through: 'grupo_materia', foreignKey: 'materia_id', as: 'grupos' });

Alumno.hasMany(Calificacion, { foreignKey: 'alumno_id', as: 'calificaciones' });
Calificacion.belongsTo(Alumno, { foreignKey: 'alumno_id', as: 'alumno' });

Materia.hasMany(Calificacion, { foreignKey: 'materia_id', as: 'calificaciones' });
Calificacion.belongsTo(Materia, { foreignKey: 'materia_id', as: 'materia' });

Maestro.hasMany(Calificacion, { foreignKey: 'maestro_id', as: 'calificaciones' });
Calificacion.belongsTo(Maestro, { foreignKey: 'maestro_id', as: 'maestro' });

Alumno.hasMany(Asistencia, { foreignKey: 'alumno_id', as: 'asistencias' });
Asistencia.belongsTo(Alumno, { foreignKey: 'alumno_id', as: 'alumno' });

Materia.hasMany(Horario, { foreignKey: 'materia_id', as: 'horarios' });
Horario.belongsTo(Materia, { foreignKey: 'materia_id', as: 'materia' });

Maestro.hasMany(Horario, { foreignKey: 'maestro_id', as: 'horarios' });
Horario.belongsTo(Maestro, { foreignKey: 'maestro_id', as: 'maestro' });

Grupo.hasMany(Horario, { foreignKey: 'grupo_id', as: 'horarios' });
Horario.belongsTo(Grupo, { foreignKey: 'grupo_id', as: 'grupo' });

module.exports = {
  sequelize,
  User,
  Alumno,
  Maestro,
  Grupo,
  Materia,
  Calificacion,
  Asistencia,
  Horario,
  Padre,
  Ciclo,
  Grado,
  Turno,
  LogAuditoria,
};
