import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  const isValidEmail = email === process.env.ADMIN_EMAIL;
  const isValidPassword = password === process.env.ADMIN_PASSWORD;

  if (!isValidEmail || !isValidPassword) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  return res.json({ token });
});

export default router;
