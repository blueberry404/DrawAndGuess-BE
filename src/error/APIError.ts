import { HttpStatusCode } from "./HttpStatusCode.ts";

export class APIError extends Error {
  public readonly httpCode: HttpStatusCode;
  public readonly isOperational: boolean;

  constructor(httpCode: HttpStatusCode, description: string, isOperational: boolean) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);

    this.httpCode = httpCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this);
  }
}
