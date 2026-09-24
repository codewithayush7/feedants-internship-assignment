import { ICompetition } from "../models/Competition";
import {
  ILifecycleEvaluation,
  LifecycleState,
  RegistrationReason,
  SubmissionReason
} from "../types";

/**
 * Ordered state machine evaluating competition lifecycle strictly chronologically:
 * 
 * 1. UPCOMING:           now < registrationStart
 * 2. REGISTRATION_OPEN:  registrationStart <= now <= registrationClose
 * 3. REGISTRATION_CLOSED: registrationClose < now < submissionStart
 * 4. SUBMISSION_OPEN:    submissionStart <= now <= submissionEnd
 * 5. SUBMISSION_CLOSED:  submissionEnd < now < resultDate
 * 6. COMPLETED:          now >= resultDate
 * 
 * Capacity (isFull) is modeled independently from lifecycle state.
 */
export function evaluateLifecycle(
  competition: Pick<ICompetition, "dates" | "totalSpots" | "registeredCount">,
  now: Date = new Date()
): ILifecycleEvaluation {
  const { registrationStart, registrationClose, submissionStart, submissionEnd, resultDate } = competition.dates;
  const nowMs = now.getTime();
  const regStartMs = new Date(registrationStart).getTime();
  const regCloseMs = new Date(registrationClose).getTime();
  const subStartMs = new Date(submissionStart).getTime();
  const subEndMs = new Date(submissionEnd).getTime();
  const resDateMs = new Date(resultDate).getTime();

  let state: LifecycleState;

  if (nowMs < regStartMs) {
    state = LifecycleState.UPCOMING;
  } else if (nowMs <= regCloseMs) {
    state = LifecycleState.REGISTRATION_OPEN;
  } else if (nowMs < subStartMs) {
    state = LifecycleState.REGISTRATION_CLOSED;
  } else if (nowMs <= subEndMs) {
    state = LifecycleState.SUBMISSION_OPEN;
  } else if (nowMs < resDateMs) {
    state = LifecycleState.SUBMISSION_CLOSED;
  } else {
    state = LifecycleState.COMPLETED;
  }

  const isFull = competition.registeredCount >= competition.totalSpots;

  // Separate capacity & action permissions from lifecycle
  const canRegister = state === LifecycleState.REGISTRATION_OPEN && !isFull;
  let registrationReason: RegistrationReason = "OPEN";
  if (state === LifecycleState.UPCOMING) {
    registrationReason = "NOT_STARTED";
  } else if (state !== LifecycleState.REGISTRATION_OPEN) {
    registrationReason = "CLOSED";
  } else if (isFull) {
    registrationReason = "FULL";
  }

  const canSubmit = nowMs >= subStartMs && nowMs <= subEndMs;
  let submissionReason: SubmissionReason = "OPEN";
  if (nowMs < subStartMs) {
    submissionReason = "NOT_STARTED";
  } else if (nowMs > subEndMs) {
    submissionReason = "CLOSED";
  }

  return {
    state,
    isFull,
    canRegister,
    registrationReason,
    canSubmit,
    submissionReason,
    registrationCloseTimestamp: regCloseMs,
    submissionStartTimestamp: subStartMs,
    submissionEndTimestamp: subEndMs,
    resultDateTimestamp: resDateMs,
    timeRemainingToRegistrationCloseMs: Math.max(0, regCloseMs - nowMs),
    timeRemainingToSubmissionEndMs: Math.max(0, subEndMs - nowMs)
  };
}
