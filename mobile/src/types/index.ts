export enum LifecycleState {
  UPCOMING = "UPCOMING",
  REGISTRATION_OPEN = "REGISTRATION_OPEN",
  REGISTRATION_CLOSED = "REGISTRATION_CLOSED",
  SUBMISSION_OPEN = "SUBMISSION_OPEN",
  SUBMISSION_CLOSED = "SUBMISSION_CLOSED",
  COMPLETED = "COMPLETED"
}

export type RegistrationReason = "OPEN" | "NOT_STARTED" | "CLOSED" | "FULL" | "ALREADY_REGISTERED";
export type SubmissionReason = "OPEN" | "NOT_STARTED" | "CLOSED" | "NOT_REGISTERED" | "ALREADY_SUBMITTED";

export interface ILifecycleEvaluation {
  state: LifecycleState;
  isFull: boolean;
  canRegister: boolean;
  registrationReason: RegistrationReason;
  canSubmit: boolean;
  submissionReason: SubmissionReason;
  registrationCloseTimestamp: number;
  submissionStartTimestamp: number;
  submissionEndTimestamp: number;
  resultDateTimestamp: number;
  timeRemainingToRegistrationCloseMs: number;
  timeRemainingToSubmissionEndMs: number;
}

export interface IJudge {
  name: string;
  role: string;
  experience: string;
  avatarUrl: string;
  introVideoUrl: string;
}

export interface IPreviousWinner {
  name: string;
  rankTitle: string;
  thumbnailUrl: string;
  videoUrl: string;
}

export interface IReward {
  position: number;
  rankTitle: string;
  amount: number;
  iconType: "trophy" | "silver_medal" | "bronze_medal" | "star";
}

export interface ICompetitionDates {
  registrationStart: string;
  registrationClose: string;
  submissionStart: string;
  submissionEnd: string;
  resultDate: string;
}

export interface ITabContent {
  en: string;
  hi: string;
}

export interface ICompetitionTabs {
  about: ITabContent;
  judgingParameters: ITabContent;
  rulesAndEligibility: ITabContent;
}

export interface IReferralInfo {
  code: string;
  url: string;
  discountNotice: string;
  rewardNotice: string;
}

export interface ICompetition {
  _id: string;
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

export interface IUserParticipationState {
  isRegistered: boolean;
  registeredAt?: string;
  paymentStatus?: "PAID" | "PENDING";
  isSubmitted: boolean;
  submission?: {
    submissionTitle: string;
    mediaUrl: string;
    submittedAt: string;
  };
}

export interface ICompetitionDetailsResponse {
  competition: ICompetition;
  lifecycle: ILifecycleEvaluation;
  spotsRemaining: number;
  userState: IUserParticipationState;
}

export interface IUser {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string;
}
