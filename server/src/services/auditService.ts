import mongoose from "mongoose";
import AuditEvent, { IAuditEvent } from "../models/auditEvent";
import { AuditEventType } from "shared/types";

interface LogEventData {
  evidenceId: any;
  eventType: AuditEventType;
  actorId: string;
  actorName: string;
  metadata?: Record<string, unknown>;
}

export const logEvent = async (data: LogEventData): Promise<void> => {
  const event = new AuditEvent({
    evidenceId: new mongoose.Types.ObjectId(data.evidenceId),
    eventType: data.eventType,
    actorId: data.actorId,
    actorName: data.actorName,
    timestamp: new Date(),
    metadata: data.metadata || {},
  });
  await event.save();
};

export const getTimeline = async (
  evidenceId: string,
): Promise<IAuditEvent[]> => {
  return AuditEvent.find({
    evidenceId: new mongoose.Types.ObjectId(evidenceId),
  })
    .sort({ timestamp: 1 })
    .lean() as unknown as IAuditEvent[];
};
