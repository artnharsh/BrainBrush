import express from "express";
import passport from "passport";
import { logout } from "../controllers/authController";
import { generateToken } from "../controllers/authController";

const router = express.Router();

router.get(
    "/google", 
    passport.authenticate("google", {scope: ["profile", "email"]})
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),

  (req, res) => {
    const user = req.user as any;
    const token = generateToken(user._id.toString());
    res.json({ user, token });
  }
);

router.get("/logout", logout);

export default router;