async function usersInRoom(room,io) {
    const setOfIdsInRoom = await io.in(room).allSockets();
    return setOfIdsInRoom.size;
  }
  module.exports=usersInRoom;