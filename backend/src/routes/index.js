const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/users", require("./user.routes"));
router.use("/games", require("./game.routes"));
router.use("/rewards", require("./rewards.routes"));
router.use("/upload", require("./upload.routes"));
router.use("/groups", require("./group.routes"));

module.exports = router;
