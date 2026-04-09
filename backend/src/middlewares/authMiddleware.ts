import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import { AuthenticatedUser } from "../types/socketTypes";

interface AuthRequest extends Request {
    user?: AuthenticatedUser;
}

interface TokenPayload extends JwtPayload {
    id: string;
    email?: string;
    username?: string;
    name?: string;
}

export const protect = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

        req.user = {
            id: decoded.id,
            email: decoded.email,
            username: decoded.username,
            name: decoded.name
        };

        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};