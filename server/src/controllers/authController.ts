import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user";

// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  const { fullName, email, password, role, badgeNumber } = req.body;

  // Validate all required fields
  if (!fullName || !email || !password || !role || !badgeNumber) {
    res.status(400).json({
      error:
        "All fields are required: fullName, email, password, role, badgeNumber",
    });
    return;
  }

  // Check for duplicate email
  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  // Hash password explicitly
  const hash = await bcrypt.hash(password, 12);

  const user = new User({
    fullName,
    email,
    passwordHash: hash,
    role,
    badgeNumber,
  });

  await user.save();

  res.status(201).json({ id: user._id, email: user.email, role: user.role });
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  // Verify password
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  // Sign JWT
  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "8h" },
  );

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  res.status(200).json({
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
};
