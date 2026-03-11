import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

export const protect = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    };

    try {
        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, JWT_SECRET);

        (req as any).user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    };
};