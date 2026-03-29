import mongoose, { Schema, Document } from "mongoose";
import { IntegrityStatus } from "../types";

export interface IEvidenceRecord extends Document {
  caseId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  sha256Hash: string;
  submittedBy: mongoose.Types.ObjectId;
  submittedAt: Date;
  currentCustodian: string;
  expertSystemResult: object;
  integrityStatus: IntegrityStatus;
  notes?: string;
}

const EvidenceRecordSchema = new Schema<IEvidenceRecord>({
  caseId: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  filePath: { type: String, required: true },
  sha256Hash: { type: String, required: true, immutable: true },
  submittedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    immutable: true,
  },
  submittedAt: { type: Date, default: Date.now, immutable: true },
  currentCustodian: { type: String, required: true },
  expertSystemResult: {
    type: Schema.Types.Mixed,
    required: true,
    immutable: true,
  },
  integrityStatus: {
    type: String,
    enum: ["unverified", "verified", "tampered"],
    default: "unverified",
  },
  notes: { type: String },
});

export default mongoose.model<IEvidenceRecord>(
  "EvidenceRecord",
  EvidenceRecordSchema,
);
