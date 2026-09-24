import mongoose, { Schema, Document } from "mongoose";
import {
  ICompetitionDates,
  IJudge,
  IPreviousWinner,
  IReward,
  ICompetitionTabs,
  IReferralInfo
} from "../types";

export interface ICompetition {
  title: string;
  slug: string;
  categoryTags: string[];
  certificateNotice: string;
  prizePool: number;
  entryFee: number;
  totalSpots: number;
  registeredCount: number;
  dates: ICompetitionDates;
  judge: IJudge;
  previousWinners: IPreviousWinner[];
  tabs: ICompetitionTabs;
  rewards: IReward[];
  referral: IReferralInfo;
  disclaimer: string;
  refundPolicy: string;
  paymentProviderNotice: string;
}

export interface ICompetitionDocument extends ICompetition, Document {}

const CompetitionSchema = new Schema<ICompetitionDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    categoryTags: [{ type: String }],
    certificateNotice: { type: String, default: "Winners get certificate" },
    prizePool: { type: Number, required: true },
    entryFee: { type: Number, required: true },
    totalSpots: { type: Number, required: true, min: 1 },
    registeredCount: { type: Number, default: 0, min: 0 },
    dates: {
      registrationStart: { type: Date, required: true },
      registrationClose: { type: Date, required: true },
      submissionStart: { type: Date, required: true },
      submissionEnd: { type: Date, required: true },
      resultDate: { type: Date, required: true }
    },
    judge: {
      name: { type: String, required: true },
      role: { type: String, required: true },
      experience: { type: String, required: true },
      avatarUrl: { type: String, default: "" },
      introVideoUrl: { type: String, default: "" }
    },
    previousWinners: [
      {
        name: { type: String, required: true },
        rankTitle: { type: String, required: true },
        thumbnailUrl: { type: String, default: "" },
        videoUrl: { type: String, default: "" }
      }
    ],
    tabs: {
      about: {
        en: { type: String, required: true },
        hi: { type: String, required: true }
      },
      judgingParameters: {
        en: { type: String, required: true },
        hi: { type: String, required: true }
      },
      rulesAndEligibility: {
        en: { type: String, required: true },
        hi: { type: String, required: true }
      }
    },
    rewards: [
      {
        position: { type: Number, required: true },
        rankTitle: { type: String, required: true },
        amount: { type: Number, required: true },
        iconType: {
          type: String,
          enum: ["trophy", "silver_medal", "bronze_medal", "star"],
          default: "star"
        }
      }
    ],
    referral: {
      code: { type: String, default: "referral123" },
      url: { type: String, default: "https://feedants.com/r/referral123" },
      discountNotice: { type: String, default: "Refer & Earn more discount" },
      rewardNotice: { type: String, default: "You earn ₹10 for every signup" }
    },
    disclaimer: {
      type: String,
      default: "Disclaimer: Only contributions from paid participants will be considered for judging."
    },
    refundPolicy: {
      type: String,
      default: "Refund policy available within 24 hours of registration before competition start."
    },
    paymentProviderNotice: {
      type: String,
      default: "Secure payments powered by Razorpay"
    }
  },
  { timestamps: true }
);

export const Competition = mongoose.model<ICompetitionDocument>(
  "Competition",
  CompetitionSchema
);
