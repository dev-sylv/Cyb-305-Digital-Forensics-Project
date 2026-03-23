export type UserRole = "submitter" | "verifier" | "admin";
export type IntegrityStatus = "unverified" | "verified" | "tampered";
export type Verdict = "CLEAN" | "SUSPICIOUS" | "HIGH_RISK";
export type Severity = "LOW" | "MEDIUM" | "HIGH";

export enum AuditEventType {
  SUBMITTED = "SUBMITTED",
  ACCESSED = "ACCESSED",
  VERIFIED = "VERIFIED",
  TAMPER_DETECTED = "TAMPER_DETECTED",
}

export interface ExpertRuleResult {
  ruleId: string;
  description: string;
  severity: Severity;
}

export interface ExpertSystemResult {
  verdict: Verdict;
  rulesTriggered: ExpertRuleResult[];
  score: number;
  analyzedAt: Date;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  badgeNumber: string;
  createdAt: Date;
}

export interface EvidenceRecord {
  id: string;
  caseId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  sha256Hash: string;
  submittedBy: string;
  submittedAt: Date;
  currentCustodian: string;
  expertSystemResult: ExpertSystemResult;
  integrityStatus: IntegrityStatus;
  notes?: string;
}

export interface AuditEvent {
  id: string;
  evidenceId: string;
  eventType: AuditEventType;
  actorId: string;
  actorName: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
}
