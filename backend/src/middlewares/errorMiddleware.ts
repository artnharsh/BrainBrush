import { Request, Response, NextFunction } from "express";

interface ErrorWithStatus extends Error {
    status?: number;
}

export const errorHandler = (
    err: ErrorWithStatus,
    req: Request,
    res: Response,
    next: NextFunction
): void => {

    console.error(err);

    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    });
};