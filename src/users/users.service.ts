import { uniqueNamesGenerator, NumberDictionary, adjectives, animals, Config } from 'unique-names-generator';
import { validate } from 'class-validator';

import { UserModel } from "./users.interface";
import { UserSignupRequest } from "./requests/request.signup";
import { getUsers, createUser as newUser } from "./users.repository";
import { generateColor } from '../utils/nameHelper';
import { APIError } from '../error/APIError';
import { HttpStatusCode } from '../error/HttpStatusCode';
import { GetUsersInfoRequest } from './requests/request.users';

export const createUser = async (request: UserSignupRequest) => {
    const errors = await validate(request, {
        skipMissingProperties: true,
        forbidUnknownValues: false,
    });
    if (errors.length > 0) {
        console.log(errors);
        throw new APIError(HttpStatusCode.BadRequest, "Data is incorrect", true);
    }

    let username = ""
    if (request.isGuestUser || !request.username) {
        const numberDictionary = NumberDictionary.generate({ min: 100, max: 999 });
        const config: Config = {
            dictionaries : [adjectives, animals, numberDictionary],
            separator: " ",
            length: 2,
            style: "capital",
        };
        username = uniqueNamesGenerator(config);
    }
    else {
        username = request.username
    }
    const color = generateColor();

    const guest = new UserModel({
        username: username,
        email: request.email,
        password: request.password,
        isGuestUser: request.isGuestUser,
        avatarColor: color,
    })
    return newUser(guest);
}

export const findUsersByIds = async (request: GetUsersInfoRequest) => {
    const errors = await validate(request, {
        skipMissingProperties: true,
        forbidUnknownValues: false,
    });
    if (errors.length > 0) {
        console.log(errors);
        throw new APIError(HttpStatusCode.BadRequest, "User Ids missing", true);
    }

    return await getUsers(request.userIds);
}