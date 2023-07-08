import { NextFunction, Request, Response } from "express";

import { CreateRoomRequest } from "./requests/request.create";
import { createNewRoom } from "./room.service";
import { HttpStatusCode } from "../error/HttpStatusCode";

export const createRoom = async (req: Request, res: Response, next: NextFunction) => {
    const roomRequest: CreateRoomRequest = req.body;
    try {
        const room = await createNewRoom(roomRequest);
        res.status(HttpStatusCode.ContentCreated).send({ data: room.toJson() });
    } catch (error) {
        next(error);   
    }
};