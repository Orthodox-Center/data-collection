import { MongoDB } from "./config/mongo.config.js";
import express from "express";
import cors from "cors";
import LetterRoute from "./routes/letter.routes.js";

export class Server {
  app;
  appServer = null;
  /**
   * A function to start the server
   */
  static start() {
    // connect to db
    MongoDB.init();
    this.app = express();
    this.middleware();
    this.setPort();
    this.routes();

    return this.app;
  }

  /**
   * A function to close the server
   * @returns {Promise<void>}
   */
  static async close() {
    await MongoDB.disconnect();
    this.appServer.close();
    console.log("SERVER CLOSED");
  }
  // set port
  static setPort() {
    this.app.set("port", process.env.PORT || 3001);
  }

  // set routes
  static routes() {
    this.app.use("/api/letter", LetterRoute);
  }
  // set middleware
  static middleware() {
    this.app.use(express.json());
    this.app.use(cors());
  }
  // listen
  static async listen(port) {
    this.appServer = this.app.listen(this.app.get("port") || port);
    // api gateway
    this.app.get("/", (req, res) => {
      res.json({ message: "Welcome to Amharic Letters API" });
    });
    console.log("SERVER RUNNING ON PORT ", this.app.get("port"));
  }
}
