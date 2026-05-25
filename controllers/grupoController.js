const { Grupo, Alumno, Materia, Horario, Maestro, Ciclo, Grado, Turno } = require('../models');
const { success, created, notFound, paginated, handleSequelizeError } = require('../utils/response');
const { buildQuery } = require('../utils/queryHelper');

exports.index = async (req, res) => {
  try {
    const { page, limit, offset, where, order } = buildQuery(req, {
      searchFields: ['nombre', 'seccion', 'aula'],
      filterFields: ['grado', 'ciclo_id', 'grado_id', 'turno_id'],
      sortable: ['id', 'nombre', 'grado', 'seccion', 'capacidad'],
      defaultOrder: [['nombre', 'ASC']],
    });

    const { rows, count } = await Grupo.findAndCountAll({
      where,
      attributes: {
        include: [
          [
            require('sequelize').literal(
              '(SELECT COUNT(*) FROM alumnos WHERE alumnos.grupo_id = "Grupo".id)'
            ),
            'alumnoCount',
          ],
        ],
      },
      include: [
        { model: Ciclo, as: 'ciclo' },
        { model: Grado, as: 'gradoRef' },
        { model: Turno, as: 'turno' },
      ],
      limit,
      offset,
      order,
    });

    return paginated(res, rows, page, limit, count);
  } catch (err) {
    return handleSequelizeError(res, err);
  }
};

exports.store = async (req, res) => {
  try {
    const grupo = await Grupo.create(req.body);
    return created(res, grupo);
  } catch (err) {
    return handleSequelizeError(res, err);
  }
};

exports.show = async (req, res) => {
  try {
    const grupo = await Grupo.findByPk(req.params.id, {
      include: [
        { model: Alumno, as: 'alumnos' },
        { model: Materia, as: 'materias' },
        {
          model: Horario,
          as: 'horarios',
          include: [
            { model: Materia, as: 'materia' },
            { model: Maestro, as: 'maestro' },
          ],
        },
      ],
    });

    if (!grupo) return notFound(res);
    return success(res, grupo);
  } catch (err) {
    return handleSequelizeError(res, err);
  }
};

exports.update = async (req, res) => {
  try {
    const grupo = await Grupo.findByPk(req.params.id);
    if (!grupo) return notFound(res);

    await grupo.update(req.body);
    return success(res, grupo);
  } catch (err) {
    return handleSequelizeError(res, err);
  }
};

exports.destroy = async (req, res) => {
  try {
    const grupo = await Grupo.findByPk(req.params.id);
    if (!grupo) return notFound(res);

    await grupo.destroy();
    return success(res, null, 'Grupo eliminado exitosamente.');
  } catch (err) {
    return handleSequelizeError(res, err);
  }
};
