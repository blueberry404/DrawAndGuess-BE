import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

import { connectDB, closeDB } from "./database";
import { UserRouter } from "./users/users.route";
import { RoomRouter } from "./room/room.route";
import { ErrorMiddleware } from "./error/error.middleware";

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

process.on('exit', async () => {
  closeDB();
});

const app: Application = express();
const port = process.env.PORT;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/v1/users", UserRouter);
app.use("/api/v1/room", RoomRouter);
app.use(ErrorMiddleware);

try {
  connectDB().then(_ => {
    console.log("Should be connected to DB!!")
    app.listen(port, (): void => {
      console.log(`Connected successfully on port ${port}`);
    });
  });
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error"
  console.error(`Error occured: ${message}`);
  process.exit(1);
}