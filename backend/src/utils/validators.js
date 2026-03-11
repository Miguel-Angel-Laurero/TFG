const { body } = require('express-validator');

const validateRegister = [
  body('username')
    .trim()
    .notEmpty().withMessage('El nombre de usuario es obligatorio')
    .isLength({ min: 3, max: 50 }).withMessage('El usuario debe tener entre 3 y 50 caracteres'),
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Email no válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
];

const validateLogin = [
  body('email').trim().isEmail().withMessage('Email no válido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
];

module.exports = { validateRegister, validateLogin };
