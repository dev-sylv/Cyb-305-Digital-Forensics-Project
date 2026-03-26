import { Router } from "express";
import {
  submitEvidence,
  listEvidence,
  getEvidence,
  verifyEvidence,
  getAuditTrail,
} from "../controllers/evidenceController";
import requireAuth from "../middleware/requireAuth";
import requireRole from "../middleware/requireRole";

const router = Router();

router.post("/", requireAuth, requireRole("submitter"), submitEvidence);
router.get("/", requireAuth, listEvidence);
router.get("/:id", requireAuth, getEvidence);
router.post(
  "/:id/verify",
  requireAuth,
  requireRole("verifier"),
  verifyEvidence,
);
router.get("/:id/audit", requireAuth, getAuditTrail);

export default router;
