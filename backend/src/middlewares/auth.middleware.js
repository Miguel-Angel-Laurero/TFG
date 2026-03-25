const { verifyToken } = require("../utils/jwt");
const { User } = require("../models");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    const user = await User.findByPk(payload.id, {
      attributes: ["id", "role"],
    });

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    req.user = { id: user.id, role: user.role }; // role siempre desde la BD
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authMiddleware;
