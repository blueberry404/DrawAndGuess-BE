import { validate } from "class-validator";
import { v4 as randomUUID } from "uuid";

import { getRoom, saveRoom } from "../cache/index.ts";
import { APIError } from "../error/APIError.ts";
import { HttpStatusCode } from "../error/HttpStatusCode.ts";
import { CreateRoomRequest } from "./requests/request.create.ts";
import { RoomInfo } from "./response/response.roominfo.ts";
import { RoomStatus } from "./roomStatus.ts";

export const createNewRoom = async (room: CreateRoomRequest) => {
    const errors = await validate(room, {
        skipMissingProperties: false
    })
    if (errors.length > 0) {
        console.log(errors);
        throw new APIError(HttpStatusCode.BadRequest, "Data is incorrect", true);
    }
    const existingRoom = await getRoom(room.userId);
    if (!existingRoom) {
        const roomInfo = new RoomInfo(randomUUID(), new Date().toISOString(), RoomStatus[RoomStatus.Created]);
        await saveRoom(room.userId, roomInfo);
        return roomInfo;
    }
    throw new APIError(HttpStatusCode.BadRequest, "A room already exists", true);
}