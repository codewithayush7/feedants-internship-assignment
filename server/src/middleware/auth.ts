import { Request, Response, NextFunction } from "express";
import { User, IUserDocument } from "../models/User";

export interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
}

/**
 * Validates demo authentication via x-user-id header.
 * Disallows arbitrary unverified user IDs in request bodies.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.headers["x-user-id"] as string;

  if (!userId || typeof userId !== "string") {
    res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Missing 'x-user-id' authentication header. Please select a demo user."
    });
    return;
  }

  try {
    const user = await User.findOne({ userId });
    if (!user) {
      res.status(401).json({
        error: "INVALID_USER",
        message: `User '${userId}' is not a recognized demo user.`
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication: attaches user to req if valid x-user-id is supplied.
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.headers["x-user-id"] as string;

  if (userId && typeof userId === "string") {
    try {
      const user = await User.findOne({ userId });
      if (user) {
        req.user = user;
      }
    } catch {
      // Ignore error for optional auth
    }
  }

  next();
}
