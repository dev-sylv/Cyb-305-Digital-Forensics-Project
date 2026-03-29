import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EvidenceRecord } from "../types";
import { listEvidence } from "../services/evidenceService";
import IntegrityBadge from "../components/integrityBadge";
import NavBar from "../components/navBar";

const EvidenceListPage = () => {
  const [records, setRecords] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listEvidence()
      .then(setRecords)
      .catch(() => setError("Failed to load evidence records"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <NavBar />
      <div style={styles.container}>
        <h2 style={styles.heading}>Evidence Records</h2>
        {loading && <p style={styles.info}>Loading...</p>}
        {error && <p style={styles.error}>{error}</p>}
        {!loading && records.length === 0 && (
          <p style={styles.info}>No evidence records found.</p>
        )}
        {records.length > 0 && (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {[
                    "Case ID",
                    "Filename",
                    "Type",
                    "Submitted By",
                    "Submitted At",
                    "Status",
                  ].map((h) => (
                    <th key={h} style={styles.th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} style={styles.tr}>
                    <td style={styles.td}>{r.caseId}</td>
                    <td style={styles.td}>
                      <Link to={`/evidence/${r._id}`} style={styles.link}>
                        {r.fileName}
                      </Link>
                    </td>
                    <td style={styles.td}>{r.fileType.toUpperCase()}</td>
                    <td style={styles.td}>
                      {typeof r.submittedBy === "object"
                        ? (r.submittedBy as { fullName: string }).fullName
                        : String(r.submittedBy)}
                    </td>
                    <td style={styles.td}>
                      {new Date(r.submittedAt).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      <IntegrityBadge status={r.integrityStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: "1000px", margin: "40px auto", padding: "0 20px" },
  heading: { fontSize: "22px", color: "#1e293b", marginBottom: "24px" },
  info: { color: "#64748b", fontSize: "14px" },
  error: { color: "#ef4444", fontSize: "14px" },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
  },
  table: { width: "100%", borderCollapse: "collapse", backgroundColor: "#fff" },
  th: {
    padding: "12px 16px",
    backgroundColor: "#1e293b",
    color: "#fff",
    fontSize: "13px",
    textAlign: "left",
  },
  tr: { borderBottom: "1px solid #e2e8f0" },
  td: { padding: "12px 16px", fontSize: "13px", color: "#334155" },
  link: { color: "#2563eb", textDecoration: "none", fontWeight: "bold" },
};

export default EvidenceListPage;
