import { NextFunction, Request, Response } from "express";
import { APIError } from "./APIError.ts";
import { HttpStatusCode } from "./HttpStatusCode.ts";

export const ErrorMiddleware = async (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof APIError && err.isOperational) {
        res.status(err.httpCode).send({ error: err.message });
    } else {
        res.status(HttpStatusCode.InternalError).send({ error: err.message });
    }
};