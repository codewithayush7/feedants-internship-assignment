import mongoose, { Schema, Document } from "mongoose";

export interface IRegistrationDocument extends Document {
  competitionId: mongoose.Types.ObjectId;
  userId: string;
  userName: string;
  userEmail: string;
  paymentStatus: "PAID" | "PENDING";
  registeredAt: Date;
}

const RegistrationSchema = new Schema<IRegistrationDocument>(
  {
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
      index: true
    },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["PAID", "PENDING"],
      default: "PAID"
    },
    registeredAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Compound unique index ensuring idempotency & zero duplicate spots
RegistrationSchema.index({ competitionId: 1, userId: 1 }, { unique: true });

export const Registration = mongoose.model<IRegistrationDocument>(
  "Registration",
  RegistrationSchema
);
