import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();
import { UserRouter } from "./routes/user.js";
import { UserForm } from "./routes/contactus.js";
import { Report } from "./routes/report.js";
import { post } from "./routes/post.js";
import { ChatRoute } from "./routes/chatRoute.js";
import { MessageRoute } from "./routes/messageRoute.js";
// import { Story } from "./routes/Story.js";
import { Friends } from "./routes/Friends.js";
import { Server } from "socket.io";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["hucschat.onrender.com", "https://starkethan.github.io/client/"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.static("public"));

app.use("/auth", UserRouter);
app.use("/user", UserForm);
app.use("/post", post);
app.use("/chat", ChatRoute);
app.use("/message", MessageRoute);
app.use("/report", Report);
// app.use("/story", Story);
app.use("/friends", Friends);



mongoose.connect(process.env.MONGO_URL);
const connection = mongoose.connection;

connection.on("error", () => console.log("Error in Connecting to Database"));
connection.once("open", () => console.log("Connected to Database"));

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: ["hucschat.onrender.com", "https://starkethan.github.io/client/"]
    
  },
});
let activeUsers = [];

io.on("connection", (socket) => {
  //add new user
  socket.on("new-user-add", (newUserId) => {
    //  if user is not added previously
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({
        userId: newUserId,
        socketId: socket.id,
      });
    }
    console.log("Connected Users", activeUsers);
    io.emit("get-users", activeUsers);
  });

  //send Message
  socket.on("send-message", (data) => {
    const { receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    console.log("Sending from socket to : ", receiverId);
    console.log("Data", data);
    if (user) {
      io.to(user.socketId).emit("receive-message", data);
    }
  });

  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log("User Disconnected", activeUsers);
    io.emit("get-users", activeUsers);
  });
});
