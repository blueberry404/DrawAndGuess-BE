import express from "express";
import * as userController from "./users.controller";

export const UserRouter = express.Router();

UserRouter.route("/")
    .post(userController.signUp);

UserRouter.route("/info")
    .post(userController.findUsers);