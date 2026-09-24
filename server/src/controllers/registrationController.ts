import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Competition } from "../models/Competition";
import { Registration } from "../models/Registration";
import { evaluateLifecycle } from "../services/lifecycleService";
import { AuthenticatedRequest } from "../middleware/auth";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  ForbiddenError
} from "../middleware/errorHandler";

export async function registerForCompetition(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "Authentication required" });
    return;
  }

  const { id } = req.params;
  const user = req.user;

  let compQuery: any = {};
  if (mongoose.Types.ObjectId.isValid(id)) {
    compQuery = { _id: id };
  } else {
    compQuery = { slug: id };
  }

  const session = await mongoose.startSession();

  try {
    let responseData: any = null;

    await session.withTransaction(async () => {
      // 1. Fetch competition inside transaction
      const competition = await Competition.findOne(compQuery).session(session);
      if (!competition) {
        throw new NotFoundError(`Competition '${id}' not found`);
      }

      // 2. Evaluate lifecycle
      const lifecycle = evaluateLifecycle(competition);
      if (!lifecycle.canRegister) {
        if (lifecycle.registrationReason === "FULL") {
          throw new ConflictError("Competition has reached maximum capacity");
        }
        throw new BadRequestError(
          `Registration is currently closed for this competition (${lifecycle.registrationReason})`
        );
      }

      // 3. Check for existing registration before reservation
      const existing = await Registration.findOne({
        competitionId: competition._id,
        userId: user.userId
      }).session(session);

      if (existing) {
        throw new ConflictError("User is already registered for this competition");
      }

      // 4. Atomically reserve spot verifying modifiedCount
      const reserveResult = await Competition.updateOne(
        {
          _id: competition._id,
          registeredCount: { $lt: competition.totalSpots }
        },
        { $inc: { registeredCount: 1 } },
        { session }
      );

      if (reserveResult.matchedCount === 0 || reserveResult.modifiedCount === 0) {
        throw new ConflictError("Competition reached maximum capacity during reservation");
      }

      // 5. Create Registration document within transaction
      const [registration] = await Registration.create(
        [
          {
            competitionId: competition._id,
            userId: user.userId,
            userName: user.name,
            userEmail: user.email,
            paymentStatus: "PAID",
            registeredAt: new Date()
          }
        ],
        { session }
      );

      // Re-fetch updated competition inside transaction
      const updatedCompetition = await Competition.findById(competition._id).session(session);
      if (!updatedCompetition) {
        throw new NotFoundError("Competition missing after update");
      }

      const updatedLifecycle = evaluateLifecycle(updatedCompetition);
      const spotsRemaining = Math.max(0, updatedCompetition.totalSpots - updatedCompetition.registeredCount);

      responseData = {
        message: "Registration successful",
        registrationId: registration._id,
        competition: updatedCompetition,
        lifecycle: updatedLifecycle,
        spotsRemaining,
        userState: {
          isRegistered: true,
          registeredAt: registration.registeredAt,
          paymentStatus: registration.paymentStatus,
          isSubmitted: false
        }
      };
    });

    res.status(201).json(responseData);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({
        error: "ALREADY_REGISTERED",
        message: "User is already registered for this competition"
      });
      return;
    }
    next(error);
  } finally {
    await session.endSession();
  }
}
