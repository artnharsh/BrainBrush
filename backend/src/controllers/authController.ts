import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

export const logout = (req: Request, res: Response) => {
    req.logout(() => {
        res.redirect("/");
    });
};

export const generateToken = (user: any) => {
    return jwt.sign(
        { 
            id: user._id || user.id, 
            username: user.name, // 🚨 Map Google's 'name' to 'username' so the frontend is happy!
            name: user.name,
            avatar: user.avatar 
        },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
};