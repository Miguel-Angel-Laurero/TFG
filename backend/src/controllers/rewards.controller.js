const { UserData } = require("../models");

const getRewards = async (req, res, next) => {
  try {
    const userData = await UserData.findOne({ where: { user_id: req.user.id } });
    if (!userData) return res.status(404).json({ message: "UserData no encontrado" });

    res.json({
      streak: userData.streak,
      coins: userData.coins,
      claimedToday: false,
      rewards: Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        reward: Math.min(Math.round(10 * (i + 1)), 100),
        claimed: i < userData.streak
      }))
    });
  } catch (err) {
    next(err);
  }
};

const claimReward = async (req, res, next) => {
  try {
    const userData = await UserData.findOne({ where: { user_id: req.user.id } });
    if (!userData) return res.status(404).json({ message: "UserData no encontrado" });

    const { amount } = req.body;

    await userData.update({ coins: userData.coins + amount });

    res.json({ coins: userData.coins });
  } catch (err) {
    next(err);
  }
};

module.exports = { claimReward, getRewards };