import mongoose, { Schema, Document } from "mongoose";
import { GameUser } from "./response/response.game";

export interface IRoom extends Document {
    name: string
    passcode: string
    mode: string
    gameRounds: number
    status: string
    createdAt: Date
    updatedAt: Date
    users: GameUser[]
    userTurns: string[]
    adminId: string
    words: string[][]
}

const GameUserSchema = new Schema<GameUser>({
    id: { type: String, required: true },
    username: { type: String, required: true },
    avatarColor: { type: String, required: true },
}, {
    _id: false,
});

const RoomSchema = new Schema<IRoom>({
    name: { type: String, required: true },
    passcode: { type: String, required: true },
    mode: { type: String, enum: ["Single", "Many"], default: "Single" },
    gameRounds: { type: Number, default: 1 },
    status: { type: String, enum: ["Created", "GameStarted", "Finished"], default: "Created" },
    users: [{
        type: GameUserSchema,
        required: true,
    }],
    userTurns: { type: [String], default: [] },
    adminId: { type: String, required: true },
    words: { type: [[String]], default: [] },
}, {
    timestamps: true,
});

export const RoomModel = mongoose.model<IRoom>('Room', RoomSchema);