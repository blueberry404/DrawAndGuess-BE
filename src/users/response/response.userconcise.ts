import { ObjectId } from "mongoose"

export interface UserConcise {
    _id: ObjectId
    username: string
    avatarColor: string
}