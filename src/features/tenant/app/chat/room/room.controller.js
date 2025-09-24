const RoomService = require("./room.service");

class RoomController {
  static async allRooms(req, res) {
    try {
      const { Room } = req.db;
      const allRooms = await RoomService.allRooms(Room);
      if (typeof allRooms !== "object")
        return res.status(404).json({ error: "No chat room found" });
      res.status(200).json(allRooms);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async createRoom(req, res) {
    try {
      const { name, description, members } = req.body;
      const { Room } = req.db;
      const { userId: createdBy, role } = req.user; // from auth middleware
      if (role !== "tenant_admin") res.status(401).json("Unathorized!");
      const room = await RoomService.createRoom({
        name,
        description,
        createdBy,
        members,
        Room,
      });
      res.json( room );
    } catch (err) {
      res.status(400).json({ ok: false, error: err.message });
    }
  }

  static async addMember(req, res) {
    try {
      const { roomId, userId } = req.body;
      const { Room, User } = req.db;
      const { role } = req.user;
      if (role !== "tenant_admin") res.status(401).json("Unathorized!");
      const room = await RoomService.addMember(roomId, userId, Room, User);
      res.json(room );
    } catch (err) {
      res.status(400).json({ ok: false, error: err.message });
    }
  }

  static async removeMember(req, res) {
    try {
      const { roomId, userId } = req.body;
      const { Room, User } = req.db;
      const { role } = req.user;
      if (role !== "tenant_admin") res.status(401).json("Unathorized!");
      const room = await RoomService.removeMember(roomId, userId, Room, User);
      res.json({ room });
    } catch (err) {
      res.status(400).json({ ok: false, error: err.message });
    }
  }

  static async getRoom(req, res) {
    try {
      const { roomId } = req.params;
      const { Room } = req.db;
      const { role } = req.user;
      if (role !== "tenant_admin") res.status(401).json("Unathorized!");
      const room = await RoomService.getRoom(roomId, Room);
      res.json({ room });
    } catch (err) {
      res.status(404).json({ ok: false, error: err.message });
    }
  }
  static async updateRoom(req, res) {
    try {
      const { roomId } = req.params;
      const { Room } = req.db;
      const { role } = req.user;
      if (role !== "tenant_admin") res.status(401).json("Unathorized!");

      const room = await RoomService.updateRoom(roomId, req.body, Room);
      if (!room) return res.status(400).json("Unable to update room");
      res.json({ room });
    } catch (err) {
      res.status(404).json({ ok: false, error: err.message });
    }
  }

  static async deleteRoom(req, res) {
    try {
      const { role } = req.user;
      const { Room } = req.db;
      if (role !== "tenant_admin") res.status(401).json("Unathorized!");

      const deletedRoom = await RoomService.deleteRoom(req.params.roomId, Room);
      if (!deletedRoom)
        return res.status(400).json({ error: "Unable to delete room" });
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = RoomController;
