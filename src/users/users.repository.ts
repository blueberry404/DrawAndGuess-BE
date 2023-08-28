import { UserResponse } from "./response/response.signup.ts";
import { UserConcise } from "./response/response.userconcise.ts";
import { UserModel } from "./users.interface.ts";

//TS2749 : https://stackoverflow.com/a/63639280/437146
export const createUser = async (user: InstanceType<typeof UserModel>) => {
    const response = await user.save();
    return new UserResponse(response._id, response.username, response.isGuestUser, response.createdAt, response.avatarColor);
}

export const findUser = async (userId: string) => {
    return await UserModel.findOne({ _id: userId }, { username: 1, avatarColor: 1 }) as (UserConcise | null | undefined);
}

export const getUsers = async (userIds: string[]) => {
    return await UserModel.find({
        _id: { $in: userIds }
    }, { username: 1, avatarColor: 1 }
    ) as (UserConcise[] | null | undefined);
};