import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Mongo DB!");
  } catch (error) {
    console.log(error);
    console.log(error.message);
    process.exit(1);
  }
};
