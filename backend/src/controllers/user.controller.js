const { User } = require('../models');
const { hashPassword } = require('../utils/bcrypt');

const getAll = async (req, res, next) => {
  try {
    // Solo admin puede listar todos los usuarios
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== Number(id)) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== Number(id)) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const { username, avatar, password } = req.body;
    const updates = {};
    if (username) updates.username = username;
    if (avatar) updates.avatar = avatar;
    if (password) updates.password = await hashPassword(password);

    await user.update(updates);
    const { password: _pw, ...safe } = user.toJSON();
    res.json(safe);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== Number(id)) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    await user.destroy();
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, update, remove };
