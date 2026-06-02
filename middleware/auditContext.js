const { sequelize } = require('../config/database');

const setAuditContext = async (req, res, next) => {
  if (req.user && req.user.id) {
    try {
      await sequelize.query(`SELECT set_config('app.current_user_id', :uid, false)`, {
        replacements: { uid: String(req.user.id) },
      });
    } catch (err) {
      // best-effort: do not block request if context cannot be set
    }
  }
  next();
};

module.exports = setAuditContext;
