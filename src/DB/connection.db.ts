import mongoose from "mongoose";
import { MONGO_URI } from "../config/config.service";
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

export default connectDB;