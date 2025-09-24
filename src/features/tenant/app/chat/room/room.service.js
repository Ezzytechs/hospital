const Room = require("./room.model");

class RoomService {
  static async allRooms(Room) {
    const rooms = await Room.find();
    if (!rooms) throw new Error("No room found");
    return rooms;
  }
  static async createRoom({
    name,
    description,
    createdBy,
    members = [],
    Room,
  }) {
    const room = await Room.create({
      name,
      description,
      createdBy,
      members: [createdBy, ...members],
    });
    return room;
  }

  static async addMember(roomId, userId, Room, User) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User with this ID does not exist");
    const room = await Room.findById(roomId);
    if (!room) throw new Error("Room not found");
    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }
        return {success:true, message:"New member added successfully"};
  }

  static async removeMember(roomId, userId, Room, User) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User with this ID does not exist");
    const room = await Room.findById(roomId);
    if (!room) throw new Error("Room not found");
    room.members = room.members.filter((id) => String(id) !== String(userId));
    await room.save();
    return {success:true, message:"New member removed successfully"};
  }

  static async getRoom(roomId, Room) {
    return Room.findById(roomId).populate("members", "username email");
  }

  static async updateRoom(roomId, data, Room) {
    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { ...data },
      { new: true }
    );
    if (!updatedRoom) throw new Error("Unable to update room");
    return updatedRoom;
  }

  static async deleteRoom(roomId, Room) {
    return await Room.findByIdAndDelete(roomId);
  }
}

module.exports = RoomService;
