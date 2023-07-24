import { UserResponse } from "./response/response.signup.ts";
import { UserModel } from "./users.interface.ts";

//TS2749 : https://stackoverflow.com/a/63639280/437146
export const createUser = async (user: InstanceType <typeof UserModel>) => {
    const response = await user.save();
    return new UserResponse(response._id, response.username, response.isGuestUser, response.createdAt, response.avatarColor);
}