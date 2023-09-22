import { GameResponse, GameUser } from "./response/response.game";
import { RoomModel } from "./room.interface";


export const createRoom = async (room: InstanceType<typeof RoomModel>) => {
    const response = await room.save();
    return new GameResponse(response._id.toString(), response.mode, response.gameRounds, response.status, response.users, response.userTurns, response.adminId, response.name, response.words);
};

export const findRoomByUserId = async (userId: string) => {
    return await RoomModel.findOne({ "users._id": userId });
};

export const checkRoomExists = async (roomName: string) => {
    return await RoomModel.exists({ name: { "$regex": roomName, $options: "i" } })
};

export const findRoom = async (roomName: string) => {
    return await RoomModel.findOne({ name: { "$regex": roomName, $options: "i" } });
};

export const findRoomById = async (roomId: string) => {
    const response = await RoomModel.findOne({ _id: roomId });
    if (response == null)
        return null
    else
        return new GameResponse(response._id.toString(), response.mode, response.gameRounds, response.status, response.users, response.userTurns, response.adminId, response.name, response.words);
};

export const addUserToRoom = async (gameUser: GameUser, turnIds: string[], roomId: string) => {
    return await RoomModel.findByIdAndUpdate(roomId,
        {
            $push: { "users": [gameUser] },
            $set: { "userTurns": turnIds }
        },
        {
            new: true,
        },
    );
};

export const deleteRoom = async (roomId: string) => {
    return await RoomModel.findOneAndDelete({ _id: roomId })
};

export const getRoomUsers = async (roomId: string) => {
    return await RoomModel.find({ _id: roomId }, { users: 1 });
};

export const findAndRemoveUser = async (userId: string) => {
    const room = await RoomModel.findOne({ 'users._id': userId })
    if (room) {
        return await RoomModel.findOneAndUpdate({ _id: room._id }, {
            $pull: { users: { id: userId } }
        });
    }
    return room;
};

export const changeRoomToStartState = async (roomId: string, words: string[]) => {
    return await RoomModel.findOneAndUpdate({ _id: roomId }, {
        $set: { "words": words, status: "GameStarted" }
    },
    {
        new: true,
    });
};