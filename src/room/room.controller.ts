import { NextFunction, Request, Response } from "express";

import { CreateRoomRequest } from "./requests/request.create.ts";
import { createNewRoom } from "./room.service.ts";
import { HttpStatusCode } from "../error/HttpStatusCode.ts";

export const createRoom = async (req: Request, res: Response, next: NextFunction) => {
    const roomRequest: CreateRoomRequest = req.body;
    try {
        const room = await createNewRoom(roomRequest);
        res.status(HttpStatusCode.ContentCreated).send({ data: room.toJson() });
    } catch (error) {
        next(error);   
    }
};