// controllers/categoryStats.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// Gestiona las estadísticas por categoría temática del Quiz.
//
// GET  /api/category-stats        → devuelve todos los stats del usuario autenticado
// POST /api/category-stats/batch  → recibe un array de { category, correct, total,
//                                   difficultyBreakdown? } y los acumula en BD.
//                                   Evalúa automáticamente si corresponde
//                                   desbloquear el siguiente nivel de dificultad.
//
// Lógica de desbloqueo (por categoría):
//   Si correct/total >= 0.70 Y total >= 5 en el nivel actual → unlockedDifficulty++
//   El nivel máximo es 3. No hay rollback automático (sticky upward).
// ─────────────────────────────────────────────────────────────────────────────
const { CategoryStat } = require("../models");

// Umbral para subir de nivel: 70 % de aciertos con mínimo 5 intentos acumulados
const UNLOCK_THRESHOLD = 0.7;
const UNLOCK_MIN_ATTEMPTS = 5;

// Devuelve todos los registros de estadísticas por categoría del usuario autenticado
const getMine = async (req, res, next) => {
  try {
    const stats = await CategoryStat.findAll({
      where: { userId: req.user.id },
      attributes: [
        "category",
        "correct",
        "total",
        "unlockedDifficulty",
        "d1Correct",
        "d1Total",
        "d2Correct",
        "d2Total",
        "d3Correct",
        "d3Total",
      ],
    });
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

// Recibe un array de entradas { category, correct, total, difficultyBreakdown? }
// y las acumula. Si la categoría ya existe para ese usuario, incrementa los contadores.
// Si no existe, la crea desde cero con los valores recibidos.
//
// difficultyBreakdown: { "1": { correct, total }, "2": { correct, total }, "3": { correct, total } }
// Tras acumular los stats por nivel, evalúa si corresponde desbloquear el siguiente nivel.
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
      const { category, correct, total, difficultyBreakdown } = entry;

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

      // ── Acumular estadísticas por nivel de dificultad ─────────────────────
      if (difficultyBreakdown && typeof difficultyBreakdown === "object") {
        const diffIncrements = {};
        for (const [level, breakdown] of Object.entries(difficultyBreakdown)) {
          const lvl = parseInt(level, 10);
          if (![1, 2, 3].includes(lvl)) continue;
          if (
            typeof breakdown?.correct !== "number" ||
            typeof breakdown?.total !== "number" ||
            breakdown.correct < 0 ||
            breakdown.total < 0 ||
            breakdown.correct > breakdown.total
          )
            continue;

          diffIncrements[`d${lvl}Correct`] = breakdown.correct;
          diffIncrements[`d${lvl}Total`] = breakdown.total;
        }
        if (Object.keys(diffIncrements).length > 0) {
          await stat.increment(diffIncrements);
          await stat.reload();
        }
      }

      // ── Evaluar si corresponde desbloquear el siguiente nivel ─────────────
      // Se evalúa iterativamente: podrías subir más de un nivel en una sesión
      // si tienes suficientes intentos acumulados en cada uno.
      let changed = false;
      while (stat.unlockedDifficulty < 3) {
        const currentLvl = stat.unlockedDifficulty;
        const accCorrect = stat[`d${currentLvl}Correct`];
        const accTotal = stat[`d${currentLvl}Total`];

        if (
          accTotal >= UNLOCK_MIN_ATTEMPTS &&
          accCorrect / accTotal >= UNLOCK_THRESHOLD
        ) {
          stat.unlockedDifficulty++;
          changed = true;
        } else {
          break; // no cumple el umbral en este nivel → no evaluar superiores
        }
      }
      if (changed) await stat.save();

      results.push({
        category: stat.category,
        correct: stat.correct,
        total: stat.total,
        unlockedDifficulty: stat.unlockedDifficulty,
      });
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
};

// Registra un fallo en una categoría concreta del usuario autenticado.
// Busca el registro (userId, category) y solo incrementa `total`, dejando
// `correct` intacto: así la diferencia (total − correct) refleja los fallos.
// Si el registro no existe, lo crea con total=1 y correct=0.
//
// Recibe:  { tag: string }  en el body
// Returns: { category, correct, total }
const trackError = async (req, res, next) => {
  try {
    const { tag } = req.body;

    if (!tag || typeof tag !== "string" || tag.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "tag es obligatorio y debe ser un string no vacío" });
    }

    const userId = req.user.id;
    const category = tag.trim();

    const [stat, created] = await CategoryStat.findOrCreate({
      where: { userId, category },
      defaults: { userId, category, correct: 0, total: 1 },
    });

    if (!created) {
      // Solo incrementamos el total: el fallo queda reflejado en total − correct
      await stat.increment({ total: 1 });
      await stat.reload();
    }

    res.json({
      category: stat.category,
      correct: stat.correct,
      total: stat.total,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMine, submitBatch, trackError };
