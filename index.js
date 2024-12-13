// packages
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

//files
import { connectDb } from "./configs/connectDb.js";
import userRoutes from "./routes/userRoute.js";
import {
  errorResponseHandler,
  invalidPathHandler,
} from "./middlewares/errorHandlers.js";
import { chatController } from "./controllers/chatController.js";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || PORT;

// db connection
connectDb();

// middlewares
app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.use("/api/users", userRoutes);

//chat controller
chatController(io);

// error handling middlewares
app.use(errorResponseHandler);
app.use(invalidPathHandler);

//test
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// start server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
