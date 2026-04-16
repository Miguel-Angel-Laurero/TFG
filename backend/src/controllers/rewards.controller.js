const { UserData } = require("../models");

const getRewards = async (req, res, next) => {
  try {
    const userData = await UserData.findOne({ where: { user_id: req.user.id } });
    if (!userData) return res.status(404).json({ message: "UserData no encontrado" });

    // ← Calcula si ya reclamó hoy
    const now = new Date();
    const lastClaim = userData.last_claimed_at ? new Date(userData.last_claimed_at) : null;

    let claimedToday = false;
    if (lastClaim) {
      const diffTime = now.setHours(0,0,0,0) - lastClaim.setHours(0,0,0,0);
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        claimedToday = true;
      } else if (diffDays > 1) {
        // ─── AQUÍ OCURRE EL RESET ───
        // Si pasó más de un día sin reclamar, volvemos a 0
        userData.streak = 0;
        await userData.save(); 
      }
    }

    res.json({
      streak: userData.streak,
      coins: userData.coins,
      claimedToday,
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