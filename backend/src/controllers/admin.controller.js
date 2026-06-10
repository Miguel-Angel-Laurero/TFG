const { User, UserData } = require("../models");
const { Op } = require("sequelize");
const { getGeminiUsageLog, GEMINI_TOKEN_BUDGET, getTotalTokensUsed } = require("./gemini-service");

const adminController = {
  // GET /api/admin/users
  getUsers: async (req, res, next) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, parseInt(req.query.limit) || 20);
      const offset = (page - 1) * limit;
      const search = req.query.search || "";

      const whereClause = search
        ? {
            [Op.or]: [
              { username: { [Op.like]: `%${search}%` } },
              { email: { [Op.like]: `%${search}%` } },
            ],
          }
        : {};

      const { count, rows } = await User.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        attributes: ["id", "username", "email", "role", "createdAt"],
        order: [["id", "DESC"]],
      });

      res.status(200).json({
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
        users: rows,
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/admin/users
createUser: async (req, res, next) => {
    try {
        const { username, email, password, role = 'user' } = req.body

        const existing = await User.findOne({
            where: { [Op.or]: [{ username }, { email }] }
        })
        if (existing) {
            return res.status(400).json({ message: 'El usuario o email ya están en uso' })
        }

        const bcrypt = require('bcryptjs')
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({ username, email, password: hashedPassword, role })

        res.status(201).json({
            message: 'Usuario creado correctamente',
            user: { id: user.id, username: user.username, email: user.email, role: user.role, createdAt: user.createdAt }
        })
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'El usuario o email ya están en uso' })
        }
        next(err)
    }
},

  // PUT /api/admin/users/:id
  updateUser: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { username, email, role } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Validar si es el último admin para evitar que se quite el rol
      if (user.role === "admin" && role === "user") {
        const adminCount = await User.count({ where: { role: "admin" } });
        if (adminCount <= 1) {
          return res
            .status(400)
            .json({
              message:
                "No puedes quitarte el rol si eres el único administrador",
            });
        }
      }

      await user.update({ username, email, role });

      res.status(200).json({
        message: "Usuario actualizado",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        return res
          .status(400)
          .json({ message: "El usuario o email ya están en uso" });
      }
      next(err);
    }
  },

  // GET /api/admin/gemini-usage
  getGeminiUsage: async (req, res) => {
    const log = await getGeminiUsageLog();
    const totals = log.reduce(
      (acc, entry) => {
        acc.promptTokens += entry.promptTokens;
        acc.outputTokens += entry.outputTokens;
        acc.totalTokens += entry.totalTokens;
        acc.cost += entry.cost;
        return acc;
      },
      { promptTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0 },
    );
    const used = getTotalTokensUsed();
    res.status(200).json({
      log,
      totals,
      budget: {
        limit: GEMINI_TOKEN_BUDGET,
        used,
        remaining: Math.max(0, GEMINI_TOKEN_BUDGET - used),
        exhausted: used >= GEMINI_TOKEN_BUDGET,
      },
    });
  },

  // DELETE /api/admin/users/:id
  deleteUser: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (req.user.id === parseInt(id)) {
        return res
          .status(400)
          .json({ message: "No puedes eliminar tu propia cuenta" });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const deletedCount = await User.destroy({ where: { id } });
      if (deletedCount === 0) {
        return res
          .status(404)
          .json({ message: "Usuario no encontrado o ya eliminado" });
      }

      res.status(200).json({ message: "Usuario eliminado correctamente" });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = adminController;
