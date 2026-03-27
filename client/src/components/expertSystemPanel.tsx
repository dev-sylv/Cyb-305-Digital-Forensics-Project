import { ExpertSystemResult } from "shared/types";

interface Props {
  result: ExpertSystemResult;
}

type Verdict = "CLEAN" | "SUSPICIOUS" | "HIGH_RISK";

const verdictConfig: Record<
  Verdict,
  { label: string; bg: string; color: string }
> = {
  CLEAN: { label: "CLEAN", bg: "#16a34a", color: "#fff" },
  SUSPICIOUS: { label: "SUSPICIOUS", bg: "#d97706", color: "#fff" },
  HIGH_RISK: { label: "HIGH RISK", bg: "#dc2626", color: "#fff" },
};

const severityColor: Record<string, string> = {
  LOW: "#64748b",
  MEDIUM: "#d97706",
  HIGH: "#dc2626",
};

const ExpertSystemPanel = ({ result }: Props) => {
  const verdict = result.verdict as Verdict;
  const vc = verdictConfig[verdict] || verdictConfig.CLEAN;

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>AI Expert System Analysis</h3>
      <div style={styles.row}>
        <span style={styles.label}>Verdict:</span>
        <span
          style={{ ...styles.badge, backgroundColor: vc.bg, color: vc.color }}>
          {vc.label}
        </span>
      </div>
      <div style={styles.row}>
        <span style={styles.label}>Score:</span>
        <span style={styles.value}>{result.score}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.label}>Analysed At:</span>
        <span style={styles.value}>
          {new Date(result.analyzedAt).toLocaleString()}
        </span>
      </div>
      <div style={{ marginTop: "12px" }}>
        <span style={styles.label}>Triggered Rules:</span>
        {result.rulesTriggered.length === 0 ? (
          <p style={styles.clean}>No anomalies detected.</p>
        ) : (
          result.rulesTriggered.map((rule) => (
            <div key={rule.ruleId} style={styles.rule}>
              <div style={styles.ruleHeader}>
                <code style={styles.ruleId}>{rule.ruleId}</code>
                <span
                  style={{
                    ...styles.severity,
                    color: severityColor[rule.severity],
                  }}>
                  {rule.severity}
                </span>
              </div>
              <p style={styles.ruleDesc}>{rule.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "20px",
    marginTop: "20px",
  },
  heading: { margin: "0 0 16px", fontSize: "16px", color: "#1e293b" },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "8px",
  },
  label: { fontSize: "13px", color: "#64748b", minWidth: "100px" },
  value: { fontSize: "13px", color: "#1e293b" },
  badge: {
    padding: "2px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  clean: { color: "#16a34a", fontSize: "13px", margin: "8px 0 0" },
  rule: {
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "10px 14px",
    marginTop: "8px",
  },
  ruleHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ruleId: { fontSize: "12px", color: "#1e293b", fontFamily: "monospace" },
  severity: { fontSize: "11px", fontWeight: "bold" },
  ruleDesc: { margin: "4px 0 0", fontSize: "12px", color: "#64748b" },
};

export default ExpertSystemPanel;
