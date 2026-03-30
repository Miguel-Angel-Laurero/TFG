const { UserData } = require("../models");

const getRewards = async (req, res, next) => {
  try {
    const userData = await UserData.findOne({ where: { user_id: req.user.id } });
    if (!userData) return res.status(404).json({ message: "UserData no encontrado" });

    // ← Calcula si ya reclamó hoy
    const claimedToday = userData.last_claimed_at
      ? new Date(userData.last_claimed_at).toDateString() === new Date().toDateString()
      : false

    res.json({
      streak: userData.streak,
      coins: userData.coins,
      claimedToday, // ← ahora devuelve el valor real
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

    const alreadyClaimed = userData.last_claimed_at
      ? new Date(userData.last_claimed_at).toDateString() === new Date().toDateString()
      : false

    if (alreadyClaimed) {
      return res.status(400).json({ message: "Ya has reclamado la recompensa hoy" })
    }

    const { amount } = req.body;

    await userData.update({
      coins: userData.coins + amount,
      streak: userData.streak + 1,        
      last_claimed_at: new Date()          
    });

    res.json({ coins: userData.coins });
  } catch (err) {
    next(err);
  }
};

module.exports = { claimReward, getRewards };