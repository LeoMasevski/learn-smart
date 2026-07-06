import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import multer from "multer";
import { env } from "../config/env";

export function notFoundHandler(req: Request, res: Response, _next: NextFunction) {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status =
    err instanceof multer.MulterError
      ? 400
      : typeof err?.status === "number"
      ? err.status
      : 500;

  const message =
    status >= 500
      ? "Internal server error"
      : err instanceof Error
      ? err.message
      : "Request failed";

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    message,
    ...(env.nodeEnv !== "production" && err instanceof Error
      ? { detail: err.message }
      : {}),
  });
};
