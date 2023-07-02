import { uniqueNamesGenerator, NumberDictionary, adjectives, animals, Config } from 'unique-names-generator';

import { UserModel } from "./users.interface";
import { UserSignupRequest } from "./requests/request.signup";
import { createUser as newUser } from "./users.repository";
import { generateColor } from '../utils/nameHelper';

export const createUser = async (request: UserSignupRequest) => {
    let username = ""
    if (request.isGuestUser) {
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
    const avatarColor = generateColor();

    const guest = new UserModel({
        username: username,
        email: request.email,
        password: request.password,
        isGuestUser: request.isGuestUser,
        avatarColor,
    })
    return newUser(guest);
}