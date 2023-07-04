import { Request, Response } from "express";

import { CreateRoomRequest } from "./requests/request.create";
import { createNewRoom } from "./room.service";

export const createRoom = async (req: Request, res: Response) => {
    const roomRequest: CreateRoomRequest = req.body;
    const room = await createNewRoom(roomRequest);
    if (room == null) {
        res.status(403).send({ error: "Error occured" });
    } else {
        res.status(201).send({ data: room.toJson() });
    }
};