import JWT from "jsonwebtoken";
import { UserModel } from "../models/UserMode.js";

export const authGuard = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const { id } = JWT.verify(token, process.env.JWT_SECRET);
      req.user = await UserModel.findById(id).select("-password");
      next();
    } catch (error) {
      let err = new Error("Not authorized! Invalid token!");
      err.statusCode = 401;
      next(err);
    }
  } else {
    const err = new Error("Authorization token is missing");
    err.statusCode = 401;
    next(err);
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.role === "admin") {
    return next();
  } else {
    const err = new Error("Not authorized! Admins only.");
    err.statusCode = 403;
    return next(err);
  }
};

export const isGuide = (req, res, next) => {
  if (req.user.role === "guide") {
    return next();
  } else {
    const err = new Error("Not authorized! Guides only.");
    err.statusCode = 403;
    return next(err);
  }
};

export const isNormal = (req, res, next) => {
  if (req.user.role === "normal") {
    return next();
  } else {
    const err = new Error("Not authorized! Normal users only.");
    err.statusCode = 403;
    return next(err);
  }
};
