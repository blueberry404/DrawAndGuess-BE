import bcrypt from "bcrypt";
import { validate } from "class-validator";

import { APIError } from "../error/APIError.ts";
import { HttpStatusCode } from "../error/HttpStatusCode.ts";
import { findUser } from "../users/users.repository.ts";
import { CreateRoomRequest } from "./requests/request.create.ts";
import { JoinRoomRequest } from "./requests/request.join.ts";
import { RoomModel } from "./room.interface.ts";
import { addUserToRoom, createRoom, findRoom, findRoomByUserId } from "./room.repository.ts";
import { GameResponse, GameUser } from "./response/response.game.ts";
import { shuffled } from "../utils/shuffle.ts";

export const createNewRoom = async (request: CreateRoomRequest) => {
    const errors = await validate(request, {
        skipMissingProperties: false
    })
    if (errors.length > 0) {
        console.log(errors);
        throw new APIError(HttpStatusCode.BadRequest, "Data is incorrect", true);
    }
    const existingRoom = await findRoomByUserId(request.userId);
    if (!existingRoom) {

        const user = await findUser(request.userId);
        console.log(`found user: ${user}`);
        if (user == null) {
            throw new APIError(HttpStatusCode.BadRequest, "User does not exist", true);
        }
        const gameUser = new GameUser(user._id.toString(), user.username, user.avatarColor);
        const salt = process.env.SALT_ROUNDS ?? "";
        const encryptedPassword = await bcrypt.hash(request.password, +salt);
        const roomInfo = new RoomModel({
            name: request.name,
            passcode: encryptedPassword,
            mode: request.mode,
            users: [gameUser],
            userTurns: [request.userId],
            adminId: request.userId,
        });
        return await createRoom(roomInfo);
    }
    throw new APIError(HttpStatusCode.BadRequest, "A room already exists", true);
}

export const joinRoomRequest = async (request: JoinRoomRequest) => {
    const errors = await validate(request, {
        skipMissingProperties: false
    })
    if (errors.length > 0) {
        console.log(errors);
        throw new APIError(HttpStatusCode.BadRequest, "Data is incorrect", true);
    }

    const user = await findUser(request.userId);
    if (user == null) {
        throw new APIError(HttpStatusCode.BadRequest, "User does not exist", true);
    }
    const gameUser = new GameUser(user._id.toString(), user.username, user.avatarColor);
    const room = await findRoom(request.name);
    if (room == null) {
        throw new APIError(HttpStatusCode.BadRequest, "Room does not exist", true);
    }
    const passwordMatches = await bcrypt.compare(request.password, room.passcode);
    if (!passwordMatches) {
        throw new APIError(HttpStatusCode.BadRequest, "Password is incorrect", true);
    }

    if (room.userTurns.find(id => id == request.userId)) {
        return new GameResponse(room._id.toString(), room.mode, room.gameRounds, room.status, room.users, room.userTurns);
    }

    const turnIds = [...room.userTurns, request.userId];
    const shuffledUsers = shuffled(turnIds);

    const modified = await addUserToRoom(gameUser, shuffledUsers, room._id.toString());
    if (modified == null) {
        throw new APIError(HttpStatusCode.InternalError, "Some error occured while adding user", true);
    }
    const response = new GameResponse(modified._id.toString(), modified.mode, modified.gameRounds, modified.status, modified.users, modified.userTurns);
    return response;
}