import api from "./api";
import { EvidenceRecord, AuditEvent } from "../types";

interface VerifyResult {
  status: string;
  computedHash: string;
  storedHash: string;
  match: boolean;
}

export const submitEvidence = async (
  formData: FormData,
  caseId: string,
): Promise<EvidenceRecord> => {
  const res = await api.post<EvidenceRecord>(
    `/evidence?caseId=${caseId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return res.data;
};

export const listEvidence = async (): Promise<EvidenceRecord[]> => {
  const res = await api.get<EvidenceRecord[]>("/evidence");
  return res.data;
};

export const getEvidence = async (id: string): Promise<EvidenceRecord> => {
  const res = await api.get<EvidenceRecord>(`/evidence/${id}`);
  return res.data;
};

export const getAuditTrail = async (id: string): Promise<AuditEvent[]> => {
  const res = await api.get<AuditEvent[]>(`/evidence/${id}/audit`);
  return res.data;
};

export const verifyEvidence = async (id: string): Promise<VerifyResult> => {
  const res = await api.post<VerifyResult>(`/evidence/${id}/verify`);
  return res.data;
};
