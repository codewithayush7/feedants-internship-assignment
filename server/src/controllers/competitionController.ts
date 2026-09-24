import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Competition } from "../models/Competition";
import { Registration } from "../models/Registration";
import { Submission } from "../models/Submission";
import { evaluateLifecycle } from "../services/lifecycleService";
import { AuthenticatedRequest } from "../middleware/auth";
import { NotFoundError } from "../middleware/errorHandler";
import { IUserParticipationState } from "../types";

export async function getCompetitionDetails(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    let query: any = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { slug: id };
    }

    const competition = await Competition.findOne(query);
    if (!competition) {
      throw new NotFoundError(`Competition '${id}' not found`);
    }

    const lifecycle = evaluateLifecycle(competition);
    const spotsRemaining = Math.max(0, competition.totalSpots - competition.registeredCount);

    let userState: IUserParticipationState = {
      isRegistered: false,
      isSubmitted: false
    };

    if (req.user) {
      const registration = await Registration.findOne({
        competitionId: competition._id,
        userId: req.user.userId
      });

      if (registration) {
        userState.isRegistered = true;
        userState.registeredAt = registration.registeredAt;
        userState.paymentStatus = registration.paymentStatus;

        const submission = await Submission.findOne({
          competitionId: competition._id,
          userId: req.user.userId
        });

        if (submission) {
          userState.isSubmitted = true;
          userState.submission = {
            submissionTitle: submission.submissionTitle,
            mediaUrl: submission.mediaUrl,
            submittedAt: submission.submittedAt
          };
        }
      }
    }

    res.status(200).json({
      competition,
      lifecycle,
      spotsRemaining,
      userState
    });
  } catch (error) {
    next(error);
  }
}

export async function listCompetitions(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const competitions = await Competition.find().sort({ createdAt: -1 });
    const formatted = competitions.map((comp) => ({
      _id: comp._id,
      title: comp.title,
      slug: comp.slug,
      prizePool: comp.prizePool,
      entryFee: comp.entryFee,
      totalSpots: comp.totalSpots,
      registeredCount: comp.registeredCount,
      spotsRemaining: Math.max(0, comp.totalSpots - comp.registeredCount),
      lifecycle: evaluateLifecycle(comp)
    }));

    res.status(200).json({ competitions: formatted });
  } catch (error) {
    next(error);
  }
}
