import JWT from "jsonwebtoken";
import { UserModel } from "../models/UserMode.js";

export const authGuard = async () => {
  try {
    if (
      req.headers.Authorization &&
      req.headers.Authorization.statsWith("Bearer")
    ) {
      const token = req.headers.Authorization.split(" ")[1];
      const { id } = JWT.verify(token, process.env.JWT_SECRET);
      req.user = await UserModel.findById(id).select("-password");
      next();
    }
  } catch (error) {
    console.log(error);
    let err = new Error("Not authorized!, Invalid Token!");
    err.statusCode = 401;
    next(err);
  }
};

// admin auth guard
export const isAdmin = () => {
  if (req.user.role === "admin") {
    return next();
  } else {
    let err = new Error("Not authorized! Admins only!");
    err.statusCode = 401;
    next(err);
  }
};

// normal user auth guard
export const isNormal = () => {
  if (req.user.role === "normal") {
    return next();
  } else {
    let err = new Error("Not authorized! Normal users only!");
    err.statusCode = 401;
    next(err);
  }
};
export const isGuide = () => {
  if (req.user.role === "guide") {
    return next();
  } else {
    let err = new Error("Not authorized! Guides only!");
    err.statusCode = 401;
    next(err);
  }
};
