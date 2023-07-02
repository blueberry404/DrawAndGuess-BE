import { Request, Response } from "express";

import { UserSignupRequest } from "../users/requests/request.signup";
import { createUser } from "./users.service";

export const signUp = async (req: Request, res: Response) => {
    const user: UserSignupRequest = req.body
    const userResponse = await createUser(user);
    return res.status(201).json({
        data: userResponse.toJson()
    });
}