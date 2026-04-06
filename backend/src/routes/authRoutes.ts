import express from "express";
import passport from "passport";
import { logout, generateToken } from "../controllers/authController";

const router = express.Router();

router.get(
    "/google", 
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  // Removed the failureRedirect so we can actually see if something crashes!
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const user = req.user as any;
    const token = generateToken(user);
    
    // THIS is the only line that is different from your original working code!
    // Instead of res.json, we throw the token into the URL and send them to React.
    res.redirect(`http://localhost:5173/auth/success?token=${token}`);
  }
);

router.get("/logout", logout);

export default router;