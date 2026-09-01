import mongoose from "mongoose";

// Setup mongoose connection lifecycle event handlers
mongoose.connection.on("connected", () => {
  console.log("📡 [database]: MongoDB connection established.");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ [database]: MongoDB runtime error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ [database]: MongoDB disconnected. Attempting to reconnect automatically...");
});

export const connectDB = async (retryCount = 0): Promise<void> => {
  const connString = process.env.DATABASE_URL || "mongodb://localhost:27017/roomswallah";
  
  try {
    const conn = await mongoose.connect(connString, {
      maxPoolSize: 50,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`📡 MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB (Attempt ${retryCount + 1}): ${(error as Error).message}`);
    
    // Instead of exiting the process immediately, retry connection in background
    if (retryCount < 5) {
      const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.log(`⏳ Retrying MongoDB connection in ${waitTime / 1000}s...`);
      setTimeout(() => {
        connectDB(retryCount + 1).catch((err) => {
          console.error("❌ Retry connection failed:", err.message);
        });
      }, waitTime);
    } else {
      console.error("⚠️ Maximum MongoDB connection retries reached. Please verify your MongoDB service is running.");
    }
  }
};
