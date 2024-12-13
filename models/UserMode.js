import mongoose, { Schema } from "mongoose";

const userSchema = mongoose.Schema(
  {
    // email
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      validate: {
        validator: (value) => {
          return value.email || value.phoneNo;
        },
      },
    },

    //phone no
    phoneNo: {
      type: String,
      required: true,
      sparse: true,
      unique: true,
      validate: {
        validator: (value) => {
          return value.phoneNo || value.email;
        },
      },
    },
    // password
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "normal", "verifiedUser", "guide"],
      default: "normal",
    },
    about: { type: String },
    reservationRequest: { type: Boolean, default: false },
    reservationStatus: { type: Boolean, default: false },
    becomeAGuide: { type: Boolean, default: false },
    documents: { type: [] },
    language: { type: [], required: true },
    reservation: {
      location: { type: String, required: true },
      timePeriod: { type: String, required: true },
      people: { type: Number, required: true },
      reservedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      cost: { type: String },
      guide: { type: Schema.Types.ObjectId, ref: "User", required: true },
      createdAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("UserModel", userSchema);
