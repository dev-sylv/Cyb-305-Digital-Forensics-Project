import { Router } from "express";
import {
  submitEvidence,
  listEvidence,
  getEvidence,
} from "../controllers/evidenceController";
import requireAuth from "../middleware/requireAuth";
import requireRole from "../middleware/requireRole";

const router = Router();

router.post("/", requireAuth, requireRole("submitter"), submitEvidence);
router.get("/", requireAuth, listEvidence);
router.get("/:id", requireAuth, getEvidence);

export default router;
