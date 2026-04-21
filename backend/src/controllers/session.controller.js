// controllers/session.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// Gestiona las sesiones de quiz del usuario autenticado.
//
// POST /api/sessions       → guarda una sesión completa en BD
// GET  /api/sessions/last  → devuelve la sesión más reciente del usuario
// GET  /api/sessions/recent?limit=14 → devuelve las N sesiones más recientes
// ─────────────────────────────────────────────────────────────────────────────
const { UserSession } = require("../models");

const MAX_LIMIT = 50;

// POST /api/sessions
// Body: { timestamp, pdfId?, stats }
const saveSession = async (req, res, next) => {
  try {
    const { timestamp, pdfId = null, stats } = req.body;

    if (
      typeof timestamp !== "number" ||
      !Number.isFinite(timestamp) ||
      typeof stats !== "object" ||
      stats === null
    ) {
      return res
        .status(400)
        .json({
          message: "timestamp (number) y stats (object) son requeridos",
        });
    }

    const session = await UserSession.create({
      userId: req.user.id,
      timestamp,
      pdfId: pdfId ? String(pdfId) : null,
      stats,
    });

    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
};

// GET /api/sessions/last
const getLastSession = async (req, res, next) => {
  try {
    const session = await UserSession.findOne({
      where: { userId: req.user.id },
      order: [["timestamp", "DESC"]],
      attributes: ["id", "timestamp", "pdfId", "stats"],
    });

    if (!session) return res.status(404).json({ message: "Sin sesiones" });

    res.json(session);
  } catch (err) {
    next(err);
  }
};

// GET /api/sessions/recent?limit=14
const getRecentSessions = async (req, res, next) => {
  try {
    const rawLimit = parseInt(req.query.limit, 10);
    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0
        ? Math.min(rawLimit, MAX_LIMIT)
        : 14;

    const sessions = await UserSession.findAll({
      where: { userId: req.user.id },
      order: [["timestamp", "DESC"]],
      limit,
      attributes: ["id", "timestamp", "pdfId", "stats"],
    });

    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

module.exports = { saveSession, getLastSession, getRecentSessions };
