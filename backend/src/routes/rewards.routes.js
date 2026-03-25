// rewards.routes.js
const router = require("express").Router();
const { claimReward , getRewards} = require("../controllers/rewards.controller");
const authenticate = require("../middlewares/auth.middleware"); 

router.get("/", authenticate, getRewards);
router.post("/claim", authenticate, claimReward);


module.exports = router;