import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { EvidenceRecord, AuditEvent } from "shared/types";
import { getEvidence, getAuditTrail } from "../services/evidenceService";
import HashDisplay from "../components/hashDisplay";
import IntegrityBadge from "../components/integrityBadge";
import ExpertSystemPanel from "../components/expertSystemPanel";
import NavBar from "../components/navBar";
import VerificationPanel from "../components/verificationPanel";
import AuditTimeline from "../components/auditTimeline";

const EvidenceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<EvidenceRecord | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [integrityStatus, setIntegrityStatus] = useState<string>("");
  const refreshAudit = () => {
    if (id) getAuditTrail(id).then(setAuditEvents);
  };

  useEffect(() => {
    if (!id) return;
    Promise.all([getEvidence(id), getAuditTrail(id)])
      .then(([rec, events]) => {
        setRecord(rec);
        setAuditEvents(events);
        setIntegrityStatus(rec.integrityStatus);
      })
      .catch(() => setError("Failed to load evidence"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <>
        <NavBar />
        <p style={styles.info}>Loading...</p>
      </>
    );
  if (error)
    return (
      <>
        <NavBar />
        <p style={styles.error}>{error}</p>
      </>
    );
  if (!record)
    return (
      <>
        <NavBar />
        <p style={styles.info}>Not found.</p>
      </>
    );

  return (
    <>
      <NavBar />
      <div style={styles.container}>
        <h2 style={styles.heading}>{record.fileName}</h2>

        {/* Metadata */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Evidence Details</h3>
          <div style={styles.grid}>
            <div>
              <span style={styles.label}>Case ID</span>
              <p style={styles.value}>{record.caseId}</p>
            </div>
            <div>
              <span style={styles.label}>File Type</span>
              <p style={styles.value}>{record.fileType.toUpperCase()}</p>
            </div>
            <div>
              <span style={styles.label}>File Size</span>
              <p style={styles.value}>
                {(record.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>
            <div>
              <span style={styles.label}>Submitted At</span>
              <p style={styles.value}>
                {new Date(record.submittedAt).toLocaleString()}
              </p>
            </div>
            <div>
              <span style={styles.label}>Integrity Status</span>
              <p style={styles.value}>
                <IntegrityBadge
                  status={integrityStatus || record.integrityStatus}
                />
              </p>
            </div>
          </div>
          <div style={{ marginTop: "16px" }}>
            <span style={styles.label}>SHA-256 Hash</span>
            <div style={{ marginTop: "6px" }}>
              <HashDisplay hash={record.sha256Hash} />
            </div>
          </div>
        </div>

        {/* Expert System */}
        <ExpertSystemPanel result={record.expertSystemResult} />

        <VerificationPanel
          evidenceId={String(record._id || "")}
          onVerified={(result) => {
            setIntegrityStatus(result.status);
            refreshAudit();
          }}
        />

        <div style={{ ...styles.card, marginTop: "20px" }}>
          <h3 style={styles.cardTitle}>Chain of Custody Audit Trail</h3>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            {auditEvents.length === 0 ? (
              "No audit events yet."
            ) : (
              <AuditTimeline events={auditEvents} />
            )}
          </p>
        </div>
      </div>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: "800px", margin: "40px auto", padding: "0 20px" },
  heading: { fontSize: "22px", color: "#1e293b", marginBottom: "24px" },
  card: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
  },
  cardTitle: { margin: "0 0 16px", fontSize: "16px", color: "#1e293b" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  label: {
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  value: { margin: "4px 0 0", fontSize: "14px", color: "#1e293b" },
  info: { padding: "40px", textAlign: "center", color: "#64748b" },
  error: { padding: "40px", textAlign: "center", color: "#ef4444" },
};

export default EvidenceDetailPage;
