import mongoose from "mongoose";
import { MONGO_URI } from "../config/config.service";
const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected");
    });
    mongoose.connection.on("open", () => console.log("open"));  
    mongoose.connection.on("disconnected", () => console.log("disconnected"));
    mongoose.connection.on("reconnected", () => console.log("reconnected"));
    mongoose.connection.on("disconnecting", () => console.log("disconnecting"));
    mongoose.connection.on("close", () => console.log("close"));
    await mongoose.connect(MONGO_URI, {
      dbName:"Social-TS",
      serverSelectionTimeoutMS: 5000,
    });
    mongoose.connection.on("error", (error) => {
      console.error(error);
      process.exit(1);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
