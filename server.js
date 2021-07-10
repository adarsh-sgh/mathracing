const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const roomOf = require("./server_modules/socket/roomOf");
const listUsersInRoom = require("./server_modules/socket/listUsersInRoom");
const usersInRoom = require("./server_modules/socket/usersInRoom");
const app = express();
const server = http.createServer(app);
const io = socketio(server);

let roomAcceptingEntry = false;
const playerLimit = 5;
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log('room of socket is ',roomOf(socket))
  console.log(`a user connected with id = ${socket.id}`);
  socket.on("userName", (userName) =>
    socket.broadcast.to(roomOf(socket)).emit("userName", socket.id, userName)
  );
  socket.on("scoreUpdate", (score) =>
    socket.broadcast
      .to(roomOf(socket))
      .emit("scoreUpdateToClient", socket.id, score)
  );
  socket.on("startGame", () =>
  io.to(roomOf(socket)).emit("startGame")
);
  addToRandomRoom();
  async function addToRandomRoom() {
    usersInRoom(roomAcceptingEntry, io)
      .then((numberOfUsers) => {
        console.log("users in this room: ", numberOfUsers);
        if (numberOfUsers < playerLimit&&roomAcceptingEntry) {
          listUsersInRoom(roomAcceptingEntry, io)
            .then((idSet) => socket.emit("existingUsers", [...idSet.keys()]))
            .then(socket.join(roomAcceptingEntry));
        } else {
          console.log('firstuser')
          socket.emit('youAreFirstUserInRoom')
          socket.join(socket.id);
          roomAcceptingEntry = socket.id;
        }
        console.log(roomOf(socket),'room of socket')
        socket.broadcast.to(roomOf(socket)).emit("userJoined", socket.id);
      })
      .catch((e) => console.log(e));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
