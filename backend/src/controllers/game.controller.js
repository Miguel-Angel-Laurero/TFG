const { Game, User } = require("../models");

const getAll = async (_req, res, next) => {
  try {
    const games = await Game.findAll({
      include: [
        { model: User, as: "user", attributes: ["id", "username", "avatar"] },
      ],
      order: [["score", "DESC"]],
    });
    res.json(games);
  } catch (err) {
    next(err);
  }
};

const getMine = async (req, res, next) => {
  try {
    const games = await Game.findAll({
      where: { userId: req.user.id },
      order: [["playedAt", "DESC"]],
    });
    res.json(games);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const game = await Game.findByPk(req.params.id, {
      include: [
        { model: User, as: "user", attributes: ["id", "username", "avatar"] },
      ],
    });
    if (!game)
      return res.status(404).json({ message: "Partida no encontrada" });
    res.json(game);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { gameName, score, duration, result } = req.body;
    const game = await Game.create({
      userId: req.user.id,
      gameName,
      score,
      duration,
      result,
    });
    res.status(201).json(game);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game)
      return res.status(404).json({ message: "Partida no encontrada" });

    if (game.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const { gameName, score, duration, result } = req.body;
    await game.update({ gameName, score, duration, result });
    res.json(game);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game)
      return res.status(404).json({ message: "Partida no encontrada" });

    if (game.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    await game.destroy();
    res.json({ message: "Partida eliminada" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getMine, getById, create, update, remove };
