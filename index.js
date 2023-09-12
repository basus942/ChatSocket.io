const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

let users = [];
const addUser = (userId, socketId) => {
  const existingUser = users.find((user) => user.userId === userId);
  if (!existingUser) {
    users.push({ userId, socketId });
  }
};
const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  const user = users.find((user) => user.userId === userId);
  return user;
};

io.on("connection", (socket) => {
  console.log("a user is connected");
  io.emit("welcome", "Youre connected to the socket server");

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUser", users);
  });

  socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
    const user = await getUser(receiverId);
    io.to(user?.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });

  socket.on("disconnect", () => {
    console.log("a user is disconnected");
    removeUser(socket.id);
    io.emit("getUser", users);
  });
});

httpServer.listen(8090, () => {
  console.log("listening on port 8090");
});
