import bodyParser from "body-parser";
import dotenv from "dotenv";
import express, { Application } from "express";
import * as http from "http";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";

dotenv.config();

import { closeDB, connectDB } from "./database/index";
import { ErrorMiddleware } from "./error/error.middleware";
import { RoomRouter } from "./room/room.route";
import { UserRouter } from "./users/users.route";
import { SocketServer } from "./socket/index";

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  webSocket.close();
  process.exit(1);
});

process.on('exit', async () => {
  webSocket.close();
  closeDB();
});

const app: Application = express();
const port = process.env.PORT;
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(ExpressMongoSanitize());

app.use("/api/v1/users", UserRouter);
app.use("/api/v1/room", RoomRouter);
app.use(ErrorMiddleware);

const server = http.createServer(app);
const webSocket = new SocketServer(server);

try {
  connectDB().then(_ => {
    console.log("Should be connected to DB!!")
    server.listen(port, (): void => {
      console.log(`Connected successfully on port ${port}`);
    });
  });
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error"
  console.error(`Error occured: ${message}`);
  webSocket.close();
  process.exit(1);
}