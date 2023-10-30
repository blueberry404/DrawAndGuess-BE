import bcrypt from "bcrypt";
import { validate } from "class-validator";

import { APIError } from "../error/APIError";
import { HttpStatusCode } from "../error/HttpStatusCode";
import { findUser } from "../users/users.repository";
import { CreateRoomRequest } from "./requests/request.create";
import { JoinRoomRequest } from "./requests/request.join";
import { RoomModel } from "./room.interface";
import { addUserToRoom, changeRoomToStartState, checkRoomExists, createRoom, deleteRoom, findAndRemoveUser, findRoom, findRoomById, findRoomByUserId, getRoomUsers } from "./room.repository";
import { GameResponse, GameUser } from "./response/response.game";
import { shuffled } from "../utils/shuffle";
import { getRandomWords } from "../words/words.repository";

export const createNewRoom = async (request: CreateRoomRequest) => {
    const errors = await validate(request, {
        skipMissingProperties: false
    })
    if (errors.length > 0) {
        console.log(errors);
        throw new APIError(HttpStatusCode.BadRequest, "Data is incorrect", true);
    }
    const existingRoom = await findRoomByUserId(request.userId);
    if (existingRoom) {
        await deleteRoom(existingRoom._id)
    }
    const room = await checkRoomExists(request.name.toLowerCase());
    if (room) {
        throw new APIError(HttpStatusCode.BadRequest, "Room with this name already exists", true);
    }
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
    const room = await findRoom(request.name.toLowerCase());
    if (room == null) {
        throw new APIError(HttpStatusCode.BadRequest, "Room does not exist", true);
    }
    const passwordMatches = await bcrypt.compare(request.password, room.passcode);
    if (!passwordMatches) {
        throw new APIError(HttpStatusCode.BadRequest, "Password is incorrect", true);
    }

    if (room.userTurns.find(id => id == request.userId)) {
        return new GameResponse(room._id.toString(), room.mode, room.gameRounds, room.status, room.users, room.userTurns, room.adminId, room.name, room.words);
    }

    const turnIds = [...room.userTurns, request.userId];
    const shuffledUsers = shuffled(turnIds);

    const modified = await addUserToRoom(gameUser, shuffledUsers, room._id.toString());
    if (modified == null) {
        throw new APIError(HttpStatusCode.InternalError, "Some error occured while adding user", true);
    }
    const response = new GameResponse(modified._id.toString(), modified.mode, modified.gameRounds, modified.status, modified.users, modified.userTurns, modified.adminId, modified.name, modified.words);
    return response;
}

export const findRoomWithRoomId = async (roomId: string) => {
    const room = await findRoomById(roomId);
    if (!room) {
        throw new APIError(HttpStatusCode.BadRequest, "Room does not exist", true);
    }
    return room;
};

export const findRoomUsers = async (roomId: string) => {
    return await getRoomUsers(roomId);
};

export const removeUserFromRoom = async (userId: string) => {
    return await findAndRemoveUser(userId);
};

export const updateRoomForStart = async (roomId: string) => {
    const room = await findRoomById(roomId);
    if (!room) {
        throw new APIError(HttpStatusCode.BadRequest, "Room does not exist", true);
    }
    const allWords: string[][] = []

    for (let i = 0; i < room.gameRounds; i++) {
        const wordsData = await getRandomWords(room.userTurns.length);
        const words = wordsData.map(w => w.word);
        allWords[i] = words;
    }

    const modified = await changeRoomToStartState(roomId, allWords);
    if (modified == null) {
        throw new APIError(HttpStatusCode.InternalError, "Some error occured while saving random words to game", true);
    }
    const response = new GameResponse(modified._id.toString(), modified.mode, modified.gameRounds, modified.status, modified.users, modified.userTurns, modified.adminId, modified.name, modified.words);
    return response;
};

export const removeRoom = async (roomId: string) => {
    await deleteRoom(roomId);
};