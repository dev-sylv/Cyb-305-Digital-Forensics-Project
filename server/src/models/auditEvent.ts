// APPEND-ONLY COLLECTION.
// This schema intentionally does not expose update or delete methods.
// All audit events are permanent once created.

import mongoose, { Schema, Document } from "mongoose";
import { AuditEventType } from "shared/types";

export interface IAuditEvent extends Document {
  evidenceId: mongoose.Types.ObjectId;
  eventType: AuditEventType;
  actorId: string;
  actorName: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

const AuditEventSchema = new Schema<IAuditEvent>({
  evidenceId: {
    type: Schema.Types.ObjectId,
    ref: "EvidenceRecord",
    required: true,
  },
  eventType: {
    type: String,
    enum: Object.values(AuditEventType),
    required: true,
  },
  actorId: { type: String, required: true },
  actorName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: Schema.Types.Mixed, default: {} },
});

export default mongoose.model<IAuditEvent>("AuditEvent", AuditEventSchema);
