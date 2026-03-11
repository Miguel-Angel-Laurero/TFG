const config = require('../../config/config');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Errores de validación de Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(422).json({
      message: 'Error de validación',
      errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Error interno del servidor',
    // Stack solo en desarrollo
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
