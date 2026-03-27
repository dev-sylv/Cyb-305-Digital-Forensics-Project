import { useState } from "react";
import axios from "axios";
import { EvidenceRecord } from "shared/types";
import { submitEvidence } from "../services/evidenceService";
import HashDisplay from "../components/hashDisplay";
import ExpertSystemPanel from "../components/expertSystemPanel";
import NavBar from "../components/navBar";

const ACCEPTED = ".jpg,.jpeg,.png,.gif,.pdf,.docx,.txt,.log,.csv";

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [caseId, setCaseId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<EvidenceRecord | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !caseId) return;
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("notes", notes);
      const record = await submitEvidence(formData, caseId);
      setResult(record);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Upload failed");
      } else {
        setError("Upload failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div style={styles.container}>
        <h2 style={styles.heading}>Upload Evidence</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Case ID *</label>
          <input
            style={styles.input}
            placeholder="e.g. CS-2026-001"
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            required
          />

          <label style={styles.label}>Evidence File *</label>
          <input
            style={styles.input}
            type="file"
            accept={ACCEPTED}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />

          <label style={styles.label}>Notes (optional)</label>
          <textarea
            style={styles.textarea}
            placeholder="Add any notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Submit Evidence"}
          </button>
        </form>

        {result && (
          <div style={styles.result}>
            <h3 style={styles.resultTitle}>✅ Evidence Submitted</h3>
            <p style={styles.meta}>
              <strong>File:</strong> {result.fileName}
            </p>
            <p style={styles.meta}>
              <strong>Case ID:</strong> {result.caseId}
            </p>
            <p style={styles.meta}>
              <strong>SHA-256 Hash:</strong>
            </p>
            <HashDisplay hash={result.sha256Hash} />
            <ExpertSystemPanel result={result.expertSystemResult} />
          </div>
        )}
      </div>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: "700px", margin: "40px auto", padding: "0 20px" },
  heading: { fontSize: "22px", color: "#1e293b", marginBottom: "24px" },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
  },
  label: { fontSize: "13px", fontWeight: "bold", color: "#475569" },
  input: {
    padding: "10px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
  },
  textarea: {
    padding: "10px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    resize: "vertical",
  },
  error: { color: "#ef4444", fontSize: "13px", margin: 0 },
  button: {
    padding: "10px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "4px",
  },
  result: {
    marginTop: "32px",
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
  },
  resultTitle: { color: "#16a34a", margin: "0 0 16px", fontSize: "18px" },
  meta: { fontSize: "14px", color: "#334155", margin: "4px 0" },
};

export default UploadPage;
