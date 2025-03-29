import mongoose from "mongoose";
import dotenv from "dotenv";

export class MongoDB {
  /**
   * Load environment variables and connect to database
   */
  static async init() {
    dotenv.config();
    this.connect();
  }

  /**
   * A function to connect to the database
   */
  static async connect() {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("SUCCESSFULLY CONNECTED TO DATABASE");
    } catch (error) {
      console.error(`ERROR CONNECTING TO DATABASE: ${error}`);
    }
  }

  /**
   * A function to disconnect from the database
   */
  static async disconnect() {
    await mongoose.disconnect();
    console.log("SUCCESSFULLY DISCONNECTED FROM DATABASE");
  }
}
