import { NextFunction, Request, Response } from "express";

import { UserSignupRequest } from "../users/requests/request.signup";
import { createUser, findUsersByIds } from "./users.service";
import { GetUsersInfoRequest } from "./requests/request.users";
import { HttpStatusCode } from "../error/HttpStatusCode";
import { GameUser } from "../room/response/response.game";

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user: UserSignupRequest = req.body
        const userResponse = await createUser(user);
        return res.status(HttpStatusCode.ContentCreated).json({
            data: userResponse.toJson()
        });
    }
    catch (error) {
        next(error);
    }
}

export const findUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const request: GetUsersInfoRequest = req.body;
        const usersResponse = await findUsersByIds(request);
        const response = !usersResponse ? [] : usersResponse?.map(user => new GameUser(user._id.toString(), user.username, user.avatarColor));
        return res.status(HttpStatusCode.Ok).json({
            data: response
        });
    }
    catch (error) {
        next(error);
    }
}