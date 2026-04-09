const router = require("express").Router();
const groupController = require("../controllers/group.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// All group routes require authentication
router.use(authMiddleware);

// GET /api/groups — list groups for current user
router.get("/", groupController.getMyGroups);

// POST /api/groups — create a new group
router.post("/", groupController.createGroup);

// POST /api/groups/join — join a group by invite code
router.post("/join", groupController.joinGroup);

// GET /api/groups/:id — get group details
router.get("/:id", groupController.getGroup);

// DELETE /api/groups/:id/leave — leave a group
router.delete("/:id/leave", groupController.leaveGroup);

// DELETE /api/groups/:id — delete a group (owner only)
router.delete("/:id", groupController.deleteGroup);

module.exports = router;
