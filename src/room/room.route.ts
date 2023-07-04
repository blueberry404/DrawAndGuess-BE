import express from "express";
import * as roomController from "./room.controller";

export const RoomRouter = express.Router();

RoomRouter.route("/")
    .post(roomController.createRoom);