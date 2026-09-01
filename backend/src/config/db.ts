import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const connString = process.env.DATABASE_URL || "mongodb://localhost:27017/checkrooms";
    const conn = await mongoose.connect(connString, {
      maxPoolSize: 100,
      minPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`📡 MongoDB Connected: ${conn.connection.host} (Pool: 10-100)`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${(error as Error).message}`);
    process.exit(1);
  }
};
