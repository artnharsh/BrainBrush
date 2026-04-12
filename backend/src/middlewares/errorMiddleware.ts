import { Request, Response, NextFunction } from "express";

interface ErrorWithStatus extends Error {
    status?: number;
}

export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`) as ErrorWithStatus;
    error.status = 404;
    next(error);
};

export const errorHandler = (
    err: ErrorWithStatus,
    req: Request,
    res: Response,
    next: NextFunction
): void => {

    console.error(err);

    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
    });
};