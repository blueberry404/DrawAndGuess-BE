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
    gameRounds: { type: Number, default: 2 },
    status: { type: String, enum: ["Created", "Ready", "GameStarted", "Finished"], default: "Created" },
    users: [{
        type: GameUserSchema,
        required: true,
    }],
    userTurns: { type: [String], default: [] },
    adminId: { type: String, required: true },
}, {
    timestamps: true,
});

export const RoomModel = mongoose.model<IRoom>('Room', RoomSchema);