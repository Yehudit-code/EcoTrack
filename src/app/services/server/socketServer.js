const { Server } = require("socket.io");

const io = new Server(4000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  // ⭐ קבלת הודעה ושידור לכל המשתמשים
  socket.on("send_message", (msg) => {
    console.log("📩 New message broadcast:", msg);
    io.emit("new_message", msg); // משדר לכולם בלי יוצא מן הכלל
  });

  // ⭐ מישהו מקליד
  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  // ⭐ מישהו מפסיק להקליד
  socket.on("typing_stop", () => {
    socket.broadcast.emit("typing_stop");
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

console.log("🚀 Socket.io server running on ws://localhost:4000");
