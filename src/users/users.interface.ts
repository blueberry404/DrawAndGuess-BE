import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    username: string
    email: string
    password: string
    isGuestUser: boolean
    avatarColor: string
    createdAt: Date
    updatedAt: Date
}

const UserSchema = new Schema<IUser>({
    username: { type: String },
    email: { type: String },
    password: { type: String },
    isGuestUser: { type: Boolean, required: true },
    avatarColor: { type: String, required: true },
}, {
    timestamps: true,
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
