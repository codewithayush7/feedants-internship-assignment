import { Response, NextFunction } from "express";
import { User } from "../models/User";
import { AuthenticatedRequest } from "../middleware/auth";

export async function getCurrentUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "UNAUTHORIZED", message: "Not authenticated" });
      return;
    }

    res.status(200).json({ user: req.user });
  } catch (error) {
    next(error);
  }
}

export async function listDemoUsers(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const users = await User.find().sort({ userId: 1 });
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
}
