const { Op } = require('sequelize');
const { Grupo, Alumno, Materia, Horario, Maestro } = require('../models');
const { success, created, notFound, paginated, error } = require('../utils/response');

exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.grado) {
      where.grado = req.query.grado;
    }

    const { rows, count } = await Grupo.findAndCountAll({
      where,
      attributes: {
        include: [
          [
            require('sequelize').literal(
              '(SELECT COUNT(*) FROM alumnos WHERE alumnos.grupo_id = Grupo.id)'
            ),
            'alumnoCount',
          ],
        ],
      },
      limit,
      offset,
      order: [['nombre', 'ASC']],
    });

    return paginated(res, rows, page, limit, count);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.store = async (req, res) => {
  try {
    const grupo = await Grupo.create(req.body);
    return created(res, grupo);
  } catch (err) {
    return error(res, err.message);
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
    return error(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const grupo = await Grupo.findByPk(req.params.id);
    if (!grupo) return notFound(res);

    await grupo.update(req.body);
    return success(res, grupo);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.destroy = async (req, res) => {
  try {
    const grupo = await Grupo.findByPk(req.params.id);
    if (!grupo) return notFound(res);

    await grupo.destroy();
    return success(res, null, 'Grupo eliminado exitosamente.');
  } catch (err) {
    return error(res, err.message);
  }
};
