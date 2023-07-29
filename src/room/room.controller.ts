import { NextFunction, Request, Response } from "express";

import { CreateRoomRequest } from "./requests/request.create.ts";
import { createNewRoom, joinRoomRequest } from "./room.service.ts";
import { HttpStatusCode } from "../error/HttpStatusCode.ts";
import { JoinRoomRequest } from "./requests/request.join.ts";

export const createRoom = async (req: Request, res: Response, next: NextFunction) => {
    const roomRequest: CreateRoomRequest = req.body;
    try {
        const response = await createNewRoom(roomRequest);
        console.log(`created::: ${JSON.stringify(response)}`);
        return res.status(HttpStatusCode.ContentCreated).send({ data: response.toJson() });
    } catch (error) {
        next(error);   
    }
};

export const joinRoom = async (req: Request, res: Response, next: NextFunction) => {
    const joinRequest: JoinRoomRequest = req.body;
    try {
        const response = await joinRoomRequest(joinRequest);
        console.log(`joined::: ${JSON.stringify(response)}`);
        return res.status(HttpStatusCode.Ok).send({ data: response.toJson() });
    } catch (error) {
        next(error);
    }
};