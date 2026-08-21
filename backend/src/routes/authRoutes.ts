import express from "express";
import passport from "passport";
import { logout, generateToken } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

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
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  }
);

// 🔒 Server-side token verification endpoint.
// Instead of the frontend decoding the JWT with atob() (no signature check),
// it calls this endpoint which uses jwt.verify() (cryptographic check).
router.get("/me", protect as any, (req: any, res: any) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username || req.user.name || "Player",
      email: req.user.email,
    },
  });
});

router.get("/logout", logout);

export default router;