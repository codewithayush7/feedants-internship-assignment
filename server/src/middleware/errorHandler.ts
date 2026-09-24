import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number = 500, code: string = "INTERNAL_SERVER_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad request") {
    super(message, 400, "BAD_REQUEST");
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict occurred") {
    super(message, 409, "CONFLICT");
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message
    });
    return;
  }

  // Handle Mongoose duplicate key error (11000)
  if ((err as any).code === 11000) {
    res.status(409).json({
      error: "DUPLICATE_KEY",
      message: "Duplicate entry detected."
    });
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    res.status(400).json({
      error: "INVALID_ID",
      message: "Malformed identifier provided."
    });
    return;
  }

  console.error("Unhandled Server Error:", err);
  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: "An unexpected internal server error occurred."
  });
}
