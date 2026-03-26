import { Request, Response } from "express";
import path from "path";
import upload from "../config/multerConfig";
import { computeHash } from "../services/hashService";
import { analyze } from "../services/expertSystem";
import { logEvent } from "../services/auditService";
import EvidenceRecord from "../models/evidenceRecord";
import { AuditEventType } from "shared/types";

// POST /api/evidence
export const submitEvidence = [
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const caseId = req.query.caseId as string;
      if (!caseId) {
        res.status(400).json({ error: "caseId is required" });
        return;
      }

      const filePath = req.file.path;
      const fileExt = path
        .extname(req.file.originalname)
        .replace(".", "")
        .toLowerCase();

      // Compute SHA-256 hash
      const sha256Hash = await computeHash(filePath);

      // Run expert system (stub for now)
      const expertSystemResult = await analyze(filePath, fileExt);

      // Save evidence record
      const evidence = new EvidenceRecord({
        caseId,
        fileName: req.file.originalname,
        fileType: fileExt,
        fileSize: req.file.size,
        filePath,
        sha256Hash,
        submittedBy: req.user.userId,
        currentCustodian: req.user.fullName,
        expertSystemResult,
        notes: req.body.notes || "",
      });

      await evidence.save();

      // Write audit event
      await logEvent({
        evidenceId: evidence._id.toString(),
        eventType: AuditEventType.SUBMITTED,
        actorId: req.user.userId,
        actorName: req.user.fullName,
      });

      res.status(201).json(evidence);
    } catch (err: any) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({ error: "File exceeds 20MB limit" });
        return;
      }
      res.status(500).json({ error: err.message });
    }
  },
];

// GET /api/evidence
export const listEvidence = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const records = await EvidenceRecord.find()
    .populate("submittedBy", "fullName email role")
    .sort({ submittedAt: -1 })
    .lean();

  res.status(200).json(records);
};

// GET /api/evidence/:id
export const getEvidence = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const record = await EvidenceRecord.findById(req.params.id).lean();

  if (!record) {
    res.status(404).json({ error: "Evidence not found" });
    return;
  }

  // Write ACCESSED audit event
  await logEvent({
    evidenceId: req.params.id,
    eventType: AuditEventType.ACCESSED,
    actorId: req.user.userId,
    actorName: req.user.fullName,
  });

  res.status(200).json(record);
};

// POST /api/evidence/:id/verify
export const verifyEvidence = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // Find the evidence record
  const record = await EvidenceRecord.findById(req.params.id);
  if (!record) {
    res.status(404).json({ error: "Evidence not found" });
    return;
  }

  // Two-actor rule — verifier cannot be the same person who submitted
  if (req.user.userId === record.submittedBy.toString()) {
    res.status(409).json({
      error:
        "Conflict of interest: you cannot verify evidence you submitted. A different verifier must perform this action.",
    });
    return;
  }

  // Recompute hash from disk — never use cached values
  const computedHash = await computeHash(record.filePath);
  const storedHash = record.sha256Hash;
  const match = computedHash === storedHash;

  // Update integrity status
  record.integrityStatus = match ? "verified" : "tampered";
  await record.save();

  // Write audit event
  await logEvent({
    evidenceId: record._id.toString(),
    eventType: match ? AuditEventType.VERIFIED : AuditEventType.TAMPER_DETECTED,
    actorId: req.user.userId,
    actorName: req.user.fullName,
    metadata: { computedHash, storedHash, match },
  });

  res
    .status(200)
    .json({
      status: match ? "verified" : "tampered",
      computedHash,
      storedHash,
      match,
    });
};
