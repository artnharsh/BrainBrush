import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

export const logout = (req: Request, res: Response) => {
    req.logout(() => {
        res.redirect("/");
    });
};

export const generateToken = (userId: string) => {
    return jwt.sign(
        { id: userId },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
};