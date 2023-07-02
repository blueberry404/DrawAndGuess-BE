import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

import { connectDB, closeDB } from "./database";
import { UserRouter } from "./users/users.route";

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

app.get("/", async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).send({
    message: "Hello World!!!!!",
  });
});

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