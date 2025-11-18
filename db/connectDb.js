"use server";
import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "getmeachai",
    });
  } catch (error) {
    console.error("DB Connection Error:", error);
    throw error;
  }
};

export const getConnectionState = async () => {
  if (!mongoose.connection.readyState) {
    await connectDB();
  }
  return mongoose.connection.readyState;
};

export default connectDB;
