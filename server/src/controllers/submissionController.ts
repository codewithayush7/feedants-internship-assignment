import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Competition } from "../models/Competition";
import { Registration } from "../models/Registration";
import { Submission } from "../models/Submission";
import { evaluateLifecycle } from "../services/lifecycleService";
import { AuthenticatedRequest } from "../middleware/auth";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  ForbiddenError
} from "../middleware/errorHandler";

export async function submitEntry(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "Authentication required" });
    return;
  }

  const { id } = req.params;
  const { submissionTitle, mediaUrl, notes } = req.body;
  const user = req.user;

  if (!submissionTitle || typeof submissionTitle !== "string" || !submissionTitle.trim()) {
    res.status(400).json({ error: "BAD_REQUEST", message: "submissionTitle is required" });
    return;
  }

  if (!mediaUrl || typeof mediaUrl !== "string" || !mediaUrl.trim()) {
    res.status(400).json({ error: "BAD_REQUEST", message: "mediaUrl is required" });
    return;
  }

  try {
    let compQuery: any = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      compQuery = { _id: id };
    } else {
      compQuery = { slug: id };
    }

    const competition = await Competition.findOne(compQuery);
    if (!competition) {
      throw new NotFoundError(`Competition '${id}' not found`);
    }

    // 1. Verify user registration
    const registration = await Registration.findOne({
      competitionId: competition._id,
      userId: user.userId
    });

    if (!registration) {
      throw new ForbiddenError(
        "User must be registered for this competition before submitting an entry"
      );
    }

    // 2. Verify lifecycle allows submissions
    const lifecycle = evaluateLifecycle(competition);
    if (!lifecycle.canSubmit) {
      throw new BadRequestError(
        `Submissions are not currently accepted for this competition (${lifecycle.submissionReason})`
      );
    }

    // 3. Verify no duplicate submission
    const existing = await Submission.findOne({
      competitionId: competition._id,
      userId: user.userId
    });

    if (existing) {
      throw new ConflictError("User has already submitted an entry for this competition");
    }

    // 4. Create submission document
    const submission = await Submission.create({
      competitionId: competition._id,
      userId: user.userId,
      userName: user.name,
      submissionTitle: submissionTitle.trim(),
      mediaUrl: mediaUrl.trim(),
      notes: (notes || "").trim(),
      status: "SUBMITTED",
      submittedAt: new Date()
    });

    res.status(201).json({
      message: "Submission submitted successfully",
      submission: {
        id: submission._id,
        submissionTitle: submission.submissionTitle,
        mediaUrl: submission.mediaUrl,
        notes: submission.notes,
        status: submission.status,
        submittedAt: submission.submittedAt
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getSubmission(
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

  try {
    let compQuery: any = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      compQuery = { _id: id };
    } else {
      compQuery = { slug: id };
    }

    const competition = await Competition.findOne(compQuery);
    if (!competition) {
      throw new NotFoundError(`Competition '${id}' not found`);
    }

    const submission = await Submission.findOne({
      competitionId: competition._id,
      userId: user.userId
    });

    if (!submission) {
      res.status(200).json({ hasSubmission: false, submission: null });
      return;
    }

    res.status(200).json({
      hasSubmission: true,
      submission: {
        id: submission._id,
        submissionTitle: submission.submissionTitle,
        mediaUrl: submission.mediaUrl,
        notes: submission.notes,
        status: submission.status,
        submittedAt: submission.submittedAt
      }
    });
  } catch (error) {
    next(error);
  }
}
