import { Router } from "express";
import {
  getCompetitionDetails,
  listCompetitions
} from "../controllers/competitionController";
import { registerForCompetition } from "../controllers/registrationController";
import { submitEntry, getSubmission } from "../controllers/submissionController";
import { requireAuth, optionalAuth } from "../middleware/auth";

const router = Router();

router.get("/", listCompetitions);
router.get("/:id", optionalAuth, getCompetitionDetails);
router.post("/:id/register", requireAuth, registerForCompetition);
router.post("/:id/submit", requireAuth, submitEntry);
router.get("/:id/submission", requireAuth, getSubmission);

export default router;
