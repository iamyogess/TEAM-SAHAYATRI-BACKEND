import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDb } from "./configs/connectDb.js";
import userRoutes from "./routes/userRoute.js";
import {
  errorResponseHandler,
  invalidPathHandler,
} from "./middlewares/errorHandlers.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || PORT;

connectDb();

app.use(express.json());
app.use(cors());
app.use("/api/users", userRoutes);

app.use(errorResponseHandler);
app.use(invalidPathHandler);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
