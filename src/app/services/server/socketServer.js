const { Server } = require("socket.io");

const io = new Server(4000, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  socket.on("send_message", (msg) => {
    io.emit("new_message", msg);
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

console.log("🚀 Socket.io server running on ws://localhost:4000");
