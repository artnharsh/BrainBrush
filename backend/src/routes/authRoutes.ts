import express from "express";
import passport from "passport";
import { logout } from "../controllers/authController";

const router = express.Router();

router.get(
    "/google", 
    passport.authenticate("google", {scope: ["profile", "email"]})
);

router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/",
        successRedirect: "/"
    })
);

router.get("/logout", logout);

export default router;