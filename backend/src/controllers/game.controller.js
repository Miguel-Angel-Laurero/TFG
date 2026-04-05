// Importamos los modelos Game y User para poder hacer consultas a la BD
const { Game, User } = require("../models");
// Op contiene operadores de Sequelize como gte (>=), lte (<=), etc.
const { Op } = require("sequelize");

// Devuelve la actividad del usuario en la semana actual agrupada por día
const getWeekly = async (req, res, next) => {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay(); // getDay() devuelve: 0=Dom, 1=Lun, ..., 6=Sáb
    // Calculamos cuántos días hay que restar para llegar al lunes
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    // Retrocedemos hasta el lunes de esta semana
    monday.setDate(monday.getDate() - daysFromMonday);
    // Ponemos la hora a 00:00:00 para incluir todo el día
    monday.setHours(0, 0, 0, 0);

    // Buscamos todas las partidas del usuario que sean de esta semana (>= lunes)
    const games = await Game.findAll({
      where: {
        userId: req.user.id, // solo las partidas del usuario autenticado
        playedAt: { [Op.gte]: monday }, // fecha de juego mayor o igual al lunes
      },
    });

    // Arrays de 7 posiciones (una por día): índice 0=Lun, 1=Mar, ..., 6=Dom
    const counts = Array(7).fill(0); // número de partidas por día
    const scores = Array(7).fill(0); // XP acumulado por día

    games.forEach((game) => {
      const dow = new Date(game.playedAt).getDay(); // día de la semana de esa partida
      // Convertimos el formato de JS (0=Dom) al nuestro (0=Lun): si es domingo → índice 6
      const idx = dow === 0 ? 6 : dow - 1;
      counts[idx]++; // sumamos una partida a ese día
      scores[idx] += game.score || 0; // acumulamos el score (o 0 si es null)
    });

    // Devolvemos los dos arrays al frontend para pintar el gráfico
    res.json({ counts, scores });
  } catch (err) {
    next(err); // cualquier error inesperado lo gestiona el middleware de errores
  }
};

// Devuelve todas las partidas de todos los usuarios (ranking global, público)
const getAll = async (_req, res, next) => {
  try {
    const games = await Game.findAll({
      include: [
        // JOIN con la tabla Users para incluir datos del jugador en cada partida
        { model: User, as: "user", attributes: ["id", "username", "avatar"] },
      ],
      order: [["score", "DESC"]], // ordenadas de mayor a menor puntuación
    });
    res.json(games);
  } catch (err) {
    next(err);
  }
};

// Devuelve solo las partidas del usuario autenticado
const getMine = async (req, res, next) => {
  try {
    const games = await Game.findAll({
      where: { userId: req.user.id }, // filtramos por el id del usuario del token
      order: [["playedAt", "DESC"]], // ordenadas por fecha, las más recientes primero
    });
    res.json(games);
  } catch (err) {
    next(err);
  }
};

// Devuelve una partida concreta buscando por su id
const getById = async (req, res, next) => {
  try {
    const game = await Game.findByPk(req.params.id, {
      // req.params.id viene de la URL: /games/:id
      include: [
        { model: User, as: "user", attributes: ["id", "username", "avatar"] },
      ],
    });
    // Si no existe ninguna partida con ese id, devolvemos 404
    if (!game)
      return res.status(404).json({ message: "Partida no encontrada" });
    res.json(game);
  } catch (err) {
    next(err);
  }
};

// Crea una nueva partida para el usuario autenticado
const create = async (req, res, next) => {
  try {
    // Extraemos los datos que manda el cliente en el cuerpo de la petición
    const { gameName, score, duration, result } = req.body;
    const game = await Game.create({
      userId: req.user.id, // el userId lo sacamos del token, no del body (evita suplantación)
      gameName,
      score,
      duration,
      result,
    });
    res.status(201).json(game); // 201 = Created
  } catch (err) {
    next(err);
  }
};

// Actualiza los datos de una partida existente
const update = async (req, res, next) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game)
      return res.status(404).json({ message: "Partida no encontrada" });

    // Solo puede editar el dueño de la partida o un admin
    if (game.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" }); // 403 = Forbidden
    }

    const { gameName, score, duration, result } = req.body;
    await game.update({ gameName, score, duration, result }); // actualiza en BD
    res.json(game); // devuelve la partida con los nuevos datos
  } catch (err) {
    next(err);
  }
};

// Elimina una partida de la BD
const remove = async (req, res, next) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game)
      return res.status(404).json({ message: "Partida no encontrada" });

    // Misma verificación de propiedad que en update
    if (game.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    await game.destroy(); // borra el registro de la BD
    res.json({ message: "Partida eliminada" });
  } catch (err) {
    next(err);
  }
};

// Exportamos todas las funciones para que game.routes.js pueda usarlas
module.exports = {
  getAll,
  getMine,
  getWeekly,
  getById,
  create,
  update,
  remove,
};
