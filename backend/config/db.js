import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("[DB] MONGODB_URI is not set in .env");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DB] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
