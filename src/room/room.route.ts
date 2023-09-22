import express from "express";
import * as roomController from "./room.controller.ts";

export const RoomRouter = express.Router();

RoomRouter.route("/")
    .post(roomController.createRoom);

RoomRouter.route("/join")
    .post(roomController.joinRoom);

RoomRouter.route("/:roomId")
    .get(roomController.getRoom);