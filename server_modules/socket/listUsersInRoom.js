async function listUsersInRoom(room,io) {
    const setOfIdsInRoom = await io.in(room).allSockets();
    return setOfIdsInRoom;
  }
  module.exports=listUsersInRoom;