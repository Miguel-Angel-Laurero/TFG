const crypto = require("crypto");
const {
  Group,
  GroupMember,
  User,
  UserData,
  CategoryStat,
} = require("../models");

const MAX_MEMBERS = 30;

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateInviteCode() {
  return crypto.randomBytes(4).toString("hex").toUpperCase(); // 8 chars hex
}

async function getUserMembership(userId) {
  return GroupMember.findOne({ where: { userId } });
}

async function assertIsOwner(groupId, userId) {
  const group = await Group.findByPk(groupId);
  if (!group) return null;
  if (group.ownerId !== userId) return false;
  return group;
}

// ── Endpoints ────────────────────────────────────────────────────────────────

/**
 * POST /api/groups
 * Crea una nueva clase. El creador se une automáticamente como primer miembro.
 */
const createGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!name || name.trim().length < 3) {
      return res
        .status(400)
        .json({ message: "El nombre debe tener al menos 3 caracteres." });
    }

    // Verificar que el usuario no esté ya en una clase
    const existing = await getUserMembership(userId);
    if (existing) {
      return res
        .status(409)
        .json({
          message:
            "Ya perteneces a una clase. Sal de ella antes de crear una nueva.",
        });
    }

    // Generar código único
    let inviteCode;
    let attempts = 0;
    do {
      inviteCode = generateInviteCode();
      attempts++;
      if (attempts > 10) throw new Error("No se pudo generar un código único.");
    } while (await Group.findOne({ where: { inviteCode } }));

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim() || null,
      inviteCode,
      ownerId: userId,
    });

    // Auto-join del creador
    await GroupMember.create({ groupId: group.id, userId });

    res.status(201).json({ group });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/groups/join
 * Unirse a una clase con código de invitación.
 */
const joinGroup = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user.id;

    if (!inviteCode) {
      return res
        .status(400)
        .json({ message: "El código de invitación es obligatorio." });
    }

    // Verificar que no esté ya en una clase
    const existing = await getUserMembership(userId);
    if (existing) {
      return res
        .status(409)
        .json({
          message:
            "Ya perteneces a una clase. Sal de ella antes de unirte a otra.",
        });
    }

    const group = await Group.findOne({
      where: { inviteCode: inviteCode.toUpperCase().trim() },
    });
    if (!group) {
      return res
        .status(404)
        .json({
          message: "Código de invitación inválido o clase no encontrada.",
        });
    }

    // Verificar límite de miembros
    const memberCount = await GroupMember.count({
      where: { groupId: group.id },
    });
    if (memberCount >= MAX_MEMBERS) {
      return res
        .status(400)
        .json({
          message: `La clase está llena (máximo ${MAX_MEMBERS} miembros).`,
        });
    }

    await GroupMember.create({ groupId: group.id, userId });

    res.status(201).json({ group });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/groups/me
 * Devuelve la clase a la que pertenece el usuario autenticado.
 */
const getMyGroup = async (req, res, next) => {
  try {
    const membership = await getUserMembership(req.user.id);
    if (!membership) {
      return res
        .status(404)
        .json({ message: "No perteneces a ninguna clase." });
    }

    const group = await Group.findByPk(membership.groupId, {
      include: [
        {
          model: GroupMember,
          as: "members",
          include: [
            {
              model: User,
              as: "member",
              attributes: ["id", "username", "avatar"],
              include: [
                {
                  model: UserData,
                  as: "userData",
                  attributes: ["accuracy", "streak", "timeSpent", "coins"],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: "owner",
          attributes: ["id", "username"],
        },
      ],
    });

    res.json({ group });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/groups/:id/stats
 * Ranking de miembros con stats. Solo accesible para miembros de la clase.
 */
const getGroupStats = async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id, 10);

    // Verificar que el usuario pertenece a esta clase
    const membership = await GroupMember.findOne({
      where: { userId: req.user.id, groupId },
    });
    if (!membership) {
      return res
        .status(403)
        .json({
          message: "No tienes acceso a las estadísticas de esta clase.",
        });
    }

    const members = await GroupMember.findAll({
      where: { groupId },
      include: [
        {
          model: User,
          as: "member",
          attributes: ["id", "username", "avatar"],
          include: [
            {
              model: UserData,
              as: "userData",
              attributes: ["accuracy", "streak", "timeSpent", "coins"],
            },
            {
              model: CategoryStat,
              as: "categoryStats",
              attributes: [
                "category",
                "correct",
                "total",
                "unlockedDifficulty",
              ],
            },
          ],
        },
      ],
    });

    const stats = members.map((m) => ({
      userId: m.member.id,
      username: m.member.username,
      avatar: m.member.avatar,
      accuracy: m.member.userData?.accuracy ?? 0,
      streak: m.member.userData?.streak ?? 0,
      timeSpent: m.member.userData?.timeSpent ?? 0,
      coins: m.member.userData?.coins ?? 0,
      categoryStats: m.member.categoryStats ?? [],
      joinedAt: m.joinedAt,
    }));

    res.json({ stats });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/groups/me/leave
 * Salir de la clase. El líder no puede salir sin transferir o disolver primero.
 */
const leaveGroup = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const membership = await getUserMembership(userId);
    if (!membership) {
      return res
        .status(404)
        .json({ message: "No perteneces a ninguna clase." });
    }

    const group = await Group.findByPk(membership.groupId);
    if (group.ownerId === userId) {
      return res.status(403).json({
        message:
          "Eres el líder de la clase. Transfiere el liderazgo a otro miembro o disuelve la clase antes de salir.",
      });
    }

    await membership.destroy();
    res.json({ message: "Has salido de la clase correctamente." });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/groups/:id/transfer
 * Transfiere el liderazgo a otro miembro. Solo el líder actual puede hacerlo.
 */
const transferLeadership = async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    const { newOwnerId } = req.body;
    const userId = req.user.id;

    if (!newOwnerId) {
      return res.status(400).json({ message: "Debes indicar el nuevo líder." });
    }

    const group = await assertIsOwner(groupId, userId);
    if (group === null)
      return res.status(404).json({ message: "Clase no encontrada." });
    if (group === false)
      return res
        .status(403)
        .json({ message: "Solo el líder puede transferir el liderazgo." });

    // Verificar que el nuevo líder sea miembro de la clase
    const targetMembership = await GroupMember.findOne({
      where: { groupId, userId: newOwnerId },
    });
    if (!targetMembership) {
      return res
        .status(400)
        .json({ message: "El usuario indicado no es miembro de esta clase." });
    }

    await group.update({ ownerId: newOwnerId });
    res.json({ message: "Liderazgo transferido correctamente.", group });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/groups/:id/members/:userId
 * Expulsar a un miembro. Solo el líder puede hacerlo.
 */
const kickMember = async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    const targetUserId = parseInt(req.params.userId, 10);

    const group = await assertIsOwner(groupId, req.user.id);
    if (group === null)
      return res.status(404).json({ message: "Clase no encontrada." });
    if (group === false)
      return res
        .status(403)
        .json({ message: "Solo el líder puede expulsar miembros." });

    if (targetUserId === req.user.id) {
      return res
        .status(400)
        .json({
          message:
            "No puedes expulsarte a ti mismo. Usa la opción de transferir o disolver.",
        });
    }

    const membership = await GroupMember.findOne({
      where: { groupId, userId: targetUserId },
    });
    if (!membership) {
      return res
        .status(404)
        .json({ message: "El usuario no es miembro de esta clase." });
    }

    await membership.destroy();
    res.json({ message: "Miembro expulsado correctamente." });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/groups/:id
 * Disolver la clase. Solo el líder puede hacerlo. CASCADE elimina los miembros.
 */
const dissolveGroup = async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id, 10);

    const group = await assertIsOwner(groupId, req.user.id);
    if (group === null)
      return res.status(404).json({ message: "Clase no encontrada." });
    if (group === false)
      return res
        .status(403)
        .json({ message: "Solo el líder puede disolver la clase." });

    await group.destroy(); // CASCADE elimina los GroupMember
    res.json({ message: "Clase disuelta correctamente." });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createGroup,
  joinGroup,
  getMyGroup,
  getGroupStats,
  leaveGroup,
  transferLeadership,
  kickMember,
  dissolveGroup,
};
