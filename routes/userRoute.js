import express from "express";
import {
  getUserProfile,
  loginUser,
  registerUser,
  uploadProfilePicture,
} from "../controllers/userController.js";
import { authGuard } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authGuard, getUserProfile);
router.post("/upload-profile", authGuard, uploadProfilePicture);

export default router;
