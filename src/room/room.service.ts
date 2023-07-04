import { validate } from "class-validator";

import { getRoom, saveRoom } from "../cache";
import { RoomInfo } from "./response/response.roominfo";
import { CreateRoomRequest } from "./requests/request.create";
import { RoomStatus } from "./roomStatus";

export const createNewRoom = async (room: CreateRoomRequest) => {
    const errors = await validate(room)
    if (errors.length > 0) {
        console.log(errors);
        //throw error
        return null;
    }
    const existingRoom = await getRoom(room.userId);
    if (existingRoom == null) {
        const roomInfo = new RoomInfo(crypto.randomUUID(), new Date().toISOString(), RoomStatus[RoomStatus.Created]);
        await saveRoom(room.userId, roomInfo);
        return roomInfo;
    }
    else {
        //throw error
        return null;
    }
}