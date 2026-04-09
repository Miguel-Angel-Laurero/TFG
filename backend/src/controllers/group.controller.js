const { Group, GroupMember, User } = require("../models");
const { randomUUID } = require("crypto");

// POST /api/groups — create a new group
const createGroup = async (req, res, next) => {
  try {
    const { name, description, gameType } = req.body;

    if (!name || name.trim().length < 3) {
      return res.status(400).json({ message: "El nombre del grupo debe tener al menos 3 caracteres" });
    }

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim() || null,
      gameType: gameType || "both",
      inviteCode: randomUUID(),
      createdBy: req.user.id,
    });

    await GroupMember.create({
      groupId: group.id,
      userId: req.user.id,
      role: "owner",
    });

    const full = await Group.findByPk(group.id, {
      include: [
        { model: User, as: "creator", attributes: ["id", "username", "avatar"] },
        {
          model: GroupMember,
          as: "members",
          include: [{ model: User, as: "user", attributes: ["id", "username", "avatar"] }],
        },
      ],
    });

    res.status(201).json(full);
  } catch (err) {
    next(err);
  }
};

// GET /api/groups — list groups the current user belongs to
const getMyGroups = async (req, res, next) => {
  try {
    const memberships = await GroupMember.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Group,
          as: "group",
          include: [
            { model: User, as: "creator", attributes: ["id", "username", "avatar"] },
            {
              model: GroupMember,
              as: "members",
              include: [{ model: User, as: "user", attributes: ["id", "username", "avatar"] }],
            },
          ],
        },
      ],
    });

    const groups = memberships.map((m) => m.group);
    res.json(groups);
  } catch (err) {
    next(err);
  }
};

// GET /api/groups/:id — get single group (must be a member)
const getGroup = async (req, res, next) => {
  try {
    const { id } = req.params;

    const membership = await GroupMember.findOne({
      where: { groupId: id, userId: req.user.id },
    });

    if (!membership) {
      return res.status(403).json({ message: "No perteneces a este grupo" });
    }

    const group = await Group.findByPk(id, {
      include: [
        { model: User, as: "creator", attributes: ["id", "username", "avatar"] },
        {
          model: GroupMember,
          as: "members",
          include: [{ model: User, as: "user", attributes: ["id", "username", "avatar"] }],
        },
      ],
    });

    if (!group) return res.status(404).json({ message: "Grupo no encontrado" });

    res.json(group);
  } catch (err) {
    next(err);
  }
};

// POST /api/groups/join — join a group by invite code
const joinGroup = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({ message: "Código de invitación requerido" });
    }

    const group = await Group.findOne({ where: { inviteCode } });
    if (!group) {
      return res.status(404).json({ message: "Código de invitación inválido" });
    }

    const existing = await GroupMember.findOne({
      where: { groupId: group.id, userId: req.user.id },
    });

    if (existing) {
      return res.status(409).json({ message: "Ya perteneces a este grupo" });
    }

    await GroupMember.create({
      groupId: group.id,
      userId: req.user.id,
      role: "member",
    });

    const full = await Group.findByPk(group.id, {
      include: [
        { model: User, as: "creator", attributes: ["id", "username", "avatar"] },
        {
          model: GroupMember,
          as: "members",
          include: [{ model: User, as: "user", attributes: ["id", "username", "avatar"] }],
        },
      ],
    });

    res.status(201).json(full);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/groups/:id/leave — leave a group
const leaveGroup = async (req, res, next) => {
  try {
    const { id } = req.params;

    const membership = await GroupMember.findOne({
      where: { groupId: id, userId: req.user.id },
    });

    if (!membership) {
      return res.status(404).json({ message: "No perteneces a este grupo" });
    }

    if (membership.role === "owner") {
      // Transfer ownership to another member or delete the group
      const otherMember = await GroupMember.findOne({
        where: { groupId: id, role: "member" },
      });

      if (otherMember) {
        await otherMember.update({ role: "owner" });
        await Group.update({ createdBy: otherMember.userId }, { where: { id } });
      } else {
        // No other members — delete the group
        await Group.destroy({ where: { id } });
        return res.json({ message: "Grupo eliminado" });
      }
    }

    await membership.destroy();
    res.json({ message: "Has abandonado el grupo" });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/groups/:id — delete a group (owner only)
const deleteGroup = async (req, res, next) => {
  try {
    const { id } = req.params;

    const group = await Group.findByPk(id);
    if (!group) return res.status(404).json({ message: "Grupo no encontrado" });

    if (group.createdBy !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Solo el propietario puede eliminar el grupo" });
    }

    await group.destroy();
    res.json({ message: "Grupo eliminado" });
  } catch (err) {
    next(err);
  }
};

module.exports = { createGroup, getMyGroups, getGroup, joinGroup, leaveGroup, deleteGroup };
