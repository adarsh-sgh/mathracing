function roomOf(socket) {
    const roomArray = Array.from(socket.rooms);
    // we assume socket has joined 2 rooms only ;
    // one it's default room (id) and other in which game gonna happen
    roomArray[0] = socket.id ? roomArray[1] : roomArray[0];
    return roomArray[0];
  }
module.exports=roomOf;