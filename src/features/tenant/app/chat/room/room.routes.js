const express = require("express");
const RoomController = require("./room.controller");
const tenantAuth = require("../../../middleware/tenantAuth"); // JWT middleware

const router = express.Router();

router.get("/", tenantAuth, RoomController.allRooms);
router.post("/", tenantAuth, RoomController.createRoom);
router.post("/add-member", tenantAuth, RoomController.addMember);
router.post("/remove-member", tenantAuth, RoomController.removeMember);
router.get("/:roomId", tenantAuth, RoomController.getRoom);
router.put("/:roomId", tenantAuth, RoomController.updateRoom);
router.delete("/:roomId", tenantAuth, RoomController.deleteRoom);

module.exports = router;
