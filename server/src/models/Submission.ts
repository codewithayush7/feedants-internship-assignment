import mongoose, { Schema, Document } from "mongoose";

export interface ISubmissionDocument extends Document {
  competitionId: mongoose.Types.ObjectId;
  userId: string;
  userName: string;
  submissionTitle: string;
  mediaUrl: string;
  notes?: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "SCORED";
  submittedAt: Date;
}

const SubmissionSchema = new Schema<ISubmissionDocument>(
  {
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
      index: true
    },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    submissionTitle: { type: String, required: true, trim: true },
    mediaUrl: { type: String, required: true, trim: true },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["SUBMITTED", "UNDER_REVIEW", "SCORED"],
      default: "SUBMITTED"
    },
    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Compound unique index ensuring one submission per user per competition
SubmissionSchema.index({ competitionId: 1, userId: 1 }, { unique: true });

export const Submission = mongoose.model<ISubmissionDocument>(
  "Submission",
  SubmissionSchema
);
