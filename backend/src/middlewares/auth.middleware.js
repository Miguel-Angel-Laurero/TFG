const { verifyToken } = require("../utils/jwt");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }

  req.user = payload; // { id, role, iat, exp }
  next();
};

module.exports = authMiddleware;
