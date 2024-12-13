import express from "express";
import {
  becomeAGuideRequest,
  getGuideVerificationRequest,
  getUserProfile,
  loginUser,
  registerUser,
  uploadProfilePicture,
  uploadUserDocuments,
} from "../controllers/userController.js";
import { authGuard, isAdmin, isNormal } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authGuard, getUserProfile);
router.post("/upload-profile", authGuard, uploadProfilePicture);
router.post("/guide-request", authGuard, isNormal, becomeAGuideRequest);
router.post("/upload-user-documents", authGuard, isNormal, uploadUserDocuments);
router.get(
  "/get-guide-verification",
  authGuard,
  isAdmin,
  getGuideVerificationRequest
);

export default router;
