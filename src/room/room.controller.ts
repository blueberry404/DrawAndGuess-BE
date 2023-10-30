import { NextFunction, Request, Response } from "express";

import { CreateRoomRequest } from "./requests/request.create";
import { createNewRoom, findRoomWithRoomId, joinRoomRequest, updateRoomForStart } from "./room.service";
import { HttpStatusCode } from "../error/HttpStatusCode";
import { JoinRoomRequest } from "./requests/request.join";

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

export const getRoom = async (req: Request, res: Response, next: NextFunction) => {
    const { roomId } = req.params;
    try {
        const response = await findRoomWithRoomId(roomId);
        return res.status(HttpStatusCode.Ok).send({ data: response.toJson() });
    } catch (err) {
        next(err);
    }
};

export const updateRoomForGameStart = async (req: Request, res: Response, next: NextFunction) => {
    const { roomId } = req.params;
    try {
        const response = await updateRoomForStart(roomId);
        return res.status(HttpStatusCode.Ok).send({ data: response.toJson() });
    } catch (err) {
        next(err);
    }
};