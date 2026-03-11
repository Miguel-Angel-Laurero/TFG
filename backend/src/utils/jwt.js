const jwt = require('jsonwebtoken');
const config = require('../../config/config');

const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
