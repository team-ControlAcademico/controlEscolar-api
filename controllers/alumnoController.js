const { Op } = require('sequelize');
const { Alumno, Grupo, Padre, Calificacion, Materia, Asistencia } = require('../models');
const { success, created, notFound, error } = require('../utils/response');

const formatAlumno = (alumno) => ({
  id: alumno.id,
  nombre: `${alumno.nombre} ${alumno.apellido_paterno} ${alumno.apellido_materno || ''}`.trim(),
  matricula: alumno.matricula,
  grupo: alumno.Grupo ? alumno.Grupo.nombre : null,
  promedio: parseFloat(alumno.promedio) || 0,
  estatus: alumno.estatus,
});

exports.index = async (req, res) => {
  try {
    const where = {};

    if (req.query.grupo) {
      const grupo = await Grupo.findOne({
        where: { nombre: { [Op.iLike]: `%${req.query.grupo}%` } },
      });
      if (grupo) {
        where.grupo_id = grupo.id;
      } else {
        return success(res, []);
      }
    }

    if (req.query.search) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${req.query.search}%` } },
        { apellido_paterno: { [Op.iLike]: `%${req.query.search}%` } },
        { matricula: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    const alumnos = await Alumno.findAll({
      where,
      include: [{ model: Grupo, as: 'Grupo' }],
      order: [['nombre', 'ASC']],
    });

    return success(res, alumnos.map(formatAlumno));
  } catch (err) {
    return error(res, err.message);
  }
};

exports.store = async (req, res) => {
  try {
    const alumno = await Alumno.create(req.body);
    const loaded = await Alumno.findByPk(alumno.id, {
      include: [{ model: Grupo, as: 'Grupo' }],
    });
    return created(res, formatAlumno(loaded));
  } catch (err) {
    return error(res, err.message);
  }
};

exports.show = async (req, res) => {
  try {
    const alumno = await Alumno.findByPk(req.params.id, {
      include: [
        { model: Grupo, as: 'Grupo' },
        { model: Padre, as: 'padre' },
        {
          model: Calificacion,
          as: 'calificaciones',
          include: [{ model: Materia, as: 'materia' }],
        },
        { model: Asistencia, as: 'asistencias' },
      ],
    });

    if (!alumno) return notFound(res);

    return success(res, {
      id: alumno.id,
      nombre: `${alumno.nombre} ${alumno.apellido_paterno} ${alumno.apellido_materno || ''}`.trim(),
      matricula: alumno.matricula,
      grupo: alumno.Grupo ? alumno.Grupo.nombre : null,
      promedio: parseFloat(alumno.promedio) || 0,
      estatus: alumno.estatus,
      fecha_nacimiento: alumno.fecha_nacimiento,
      genero: alumno.genero,
      direccion: alumno.direccion,
      telefono: alumno.telefono,
      email: alumno.email,
      calificaciones: alumno.calificaciones,
      asistencias: alumno.asistencias,
    });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const alumno = await Alumno.findByPk(req.params.id);
    if (!alumno) return notFound(res);

    await alumno.update(req.body);
    const loaded = await Alumno.findByPk(alumno.id, {
      include: [{ model: Grupo, as: 'Grupo' }],
    });
    return success(res, formatAlumno(loaded));
  } catch (err) {
    return error(res, err.message);
  }
};

exports.destroy = async (req, res) => {
  try {
    const alumno = await Alumno.findByPk(req.params.id);
    if (!alumno) return notFound(res);

    await alumno.destroy();
    return success(res, null, 'Alumno eliminado exitosamente.');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.porAlumno = async (req, res) => {
  try {
    const calificaciones = await Calificacion.findAll({
      where: { alumno_id: req.params.alumnoId },
      include: [
        { model: Materia, as: 'materia' },
        { model: require('../models').Maestro, as: 'maestro' },
      ],
      order: [['parcial', 'ASC']],
    });

    return success(res, calificaciones);
  } catch (err) {
    return error(res, err.message);
  }
};
