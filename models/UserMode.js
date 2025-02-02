import mongoose, { Schema } from "mongoose";

const reservationSchema = new Schema(
  {
    location: { type: String, required: true },
    timePeriod: { type: String, required: true }, // Example: "2024-01-01 to 2024-01-02"
    people: { type: Number, required: true },
    reservedBy: {
      type: Schema.Types.ObjectId,
      ref: "UserModel", // Ensure it refers to the UserModel
      required: true,
    },
    guide: {
      type: Schema.Types.ObjectId,
      ref: "UserModel", // Guide reference
      required: true,
    },
    cost: {
      totalCost: { type: Number, required: true },
      tds: { type: Number, required: true }, // Tax Deducted at Source (TDS)
      profitMargin: { type: Number, required: true },
      finalCost: { type: Number, required: true },
      afterTdsAndProfit: { type: Number, required: true },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false } // Prevent MongoDB from auto-creating an _id for nested schemas
);

const userSchema = new Schema(
  {
    // Basic Information
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, sparse: true },
    password: { type: String, required: true },
    profilePicture: { type: String },

    // Roles and Verification
    role: {
      type: String,
      enum: ["admin", "normal", "verifiedUser", "guide"],
      default: "normal",
    },
    verified: { type: Boolean, default: false },
    becomeAGuide: { type: Boolean, default: false },

    // Guide Information
    about: { type: String },
    language: { type: [String], required: true },

    // Reservation System
    reservationRequest: { type: Boolean, default: false },
    reservationStatus: { type: Boolean, default: false },
    reservation: [reservationSchema], // Use nested reservation schema

    // Additional Information
    documents: { type: [String] }, // List of document paths/URLs
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("UserModel", userSchema);
