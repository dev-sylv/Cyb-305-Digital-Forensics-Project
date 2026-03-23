import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { Request } from "express";

const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "pdf",
  "docx",
  "txt",
  "log",
  "csv",
];

const storage = multer.diskStorage({
  destination: (req: Request, _file, cb) => {
    // caseId comes from query param, not body (body not parsed yet on multipart)
    const caseId = req.query.caseId as string;
    const evidenceId = crypto.randomUUID();

    // Attach evidenceId to req so controller can reuse it
    (req as any).evidenceId = evidenceId;

    const uploadPath = path.join("uploads", caseId, evidenceId);
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const ext = file.originalname.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    cb(new Error("Unsupported file type"));
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

export default upload;
