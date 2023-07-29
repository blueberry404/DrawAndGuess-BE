import { GameResponse, GameUser } from "./response/response.game";
import { RoomModel } from "./room.interface";


export const createRoom = async (room: InstanceType<typeof RoomModel>) => {
    const response = await room.save();
    return new GameResponse(response._id.toString(), response.mode, response.gameRounds, response.status, response.users, response.userTurns);
};

export const findRoomByUserId = async (userId: string) => {
    return await RoomModel.findOne({ "users._id": userId });
};

export const findRoom = async (roomName: string) => {
    return await RoomModel.findOne({ name: roomName });
};

export const addUserToRoom = async (gameUser: GameUser, turnIds: string[], roomId: string) => {
    return await RoomModel.findByIdAndUpdate(roomId,
        {
            $push: { "users": [gameUser] },
            $set: { "userTurns": turnIds }
        },
        {
            new: true, projection: {
                mode: 1, gameRounds: 1, status: 1, users: 1, userTurns: 1
            }
        },
    );
};