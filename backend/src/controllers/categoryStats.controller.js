// controllers/categoryStats.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// Gestiona las estadísticas por categoría temática del Quiz.
//
// GET  /api/category-stats        → devuelve todos los stats del usuario autenticado
// POST /api/category-stats/batch  → recibe un array de { category, correct, total }
//                                   y los acumula en BD (upsert incremental)
// ─────────────────────────────────────────────────────────────────────────────
const { CategoryStat } = require("../models");

// Devuelve todos los registros de estadísticas por categoría del usuario autenticado
const getMine = async (req, res, next) => {
  try {
    const stats = await CategoryStat.findAll({
      where: { userId: req.user.id },
      attributes: ["category", "correct", "total"],
    });
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

// Recibe un array de entradas { category, correct, total } y las acumula.
// Si la categoría ya existe para ese usuario, incremente los contadores.
// Si no existe, la crea desde cero con los valores recibidos.
const submitBatch = async (req, res, next) => {
  try {
    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res
        .status(400)
        .json({ message: "entries debe ser un array no vacío" });
    }

    const userId = req.user.id;
    const results = [];

    for (const entry of entries) {
      const { category, correct, total } = entry;

      // Validación básica de cada entrada
      if (
        typeof category !== "string" ||
        typeof correct !== "number" ||
        typeof total !== "number" ||
        correct < 0 ||
        total < 0 ||
        correct > total
      ) {
        continue; // ignoramos entradas malformadas sin abortar el resto
      }

      const [stat, created] = await CategoryStat.findOrCreate({
        where: { userId, category },
        defaults: { userId, category, correct, total },
      });

      if (!created) {
        // Acumulamos en lugar de sobrescribir para conservar el historial
        await stat.increment({ correct, total });
        await stat.reload();
      }

      results.push({
        category: stat.category,
        correct: stat.correct,
        total: stat.total,
      });
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMine, submitBatch };
