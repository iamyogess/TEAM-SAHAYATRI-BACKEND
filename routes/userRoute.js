import express from "express";
import {
  becomeAGuideRequest,
  getUserProfile,
  loginUser,
  registerUser,
  uploadProfilePicture,
  uploadUserDocuments,
} from "../controllers/userController.js";
import { authGuard, isNormal } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authGuard, getUserProfile);
router.post("/upload-profile", authGuard, uploadProfilePicture);
router.post("/guide-request", authGuard, isNormal, becomeAGuideRequest);
router.post("/upload-user-documents", authGuard, isNormal, uploadUserDocuments);

export default router;
