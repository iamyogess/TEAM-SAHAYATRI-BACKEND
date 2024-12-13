import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./configs/connectDb.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || PORT;


connectDb();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
