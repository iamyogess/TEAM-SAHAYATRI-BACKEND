export const chatController = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected!");

    // incoming message
    socket.on("chat message", (msg) => {
      io.emit("chat message", msg);
    });

    // handle disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected!");
    });
  });
};
