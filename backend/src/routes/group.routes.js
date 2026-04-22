const router = require("express").Router();
const { authMiddleware: auth } = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/group.controller");

// POST /api/groups — crear una clase
router.post("/", auth, ctrl.createGroup);

// POST /api/groups/join — unirse con código de invitación
router.post("/join", auth, ctrl.joinGroup);

// GET /api/groups/me — obtener la clase a la que pertenezco
router.get("/me", auth, ctrl.getMyGroup);

// GET /api/groups/:id/stats — ranking de stats de los miembros
router.get("/:id/stats", auth, ctrl.getGroupStats);

// DELETE /api/groups/me/leave — salir de la clase (líder bloqueado)
router.delete("/me/leave", auth, ctrl.leaveGroup);

// POST /api/groups/:id/transfer — transferir liderazgo (solo líder)
router.post("/:id/transfer", auth, ctrl.transferLeadership);

// DELETE /api/groups/:id/members/:userId — expulsar miembro (solo líder)
router.delete("/:id/members/:userId", auth, ctrl.kickMember);

// DELETE /api/groups/:id — disolver la clase (solo líder)
router.delete("/:id", auth, ctrl.dissolveGroup);

module.exports = router;
