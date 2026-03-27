interface Props {
  status: string;
  computedHash: string;
  storedHash: string;
  match: boolean;
}

const VerificationResult = ({
  //   status,
  computedHash,
  storedHash,
  match,
}: Props) => {
  const isVerified = match;

  const highlightDiff = (a: string, b: string) => {
    return a.split("").map((char, i) => (
      <span key={i} style={{ color: char !== b[i] ? "#dc2626" : "inherit" }}>
        {char}
      </span>
    ));
  };

  return (
    <div
      style={{
        ...styles.container,
        borderColor: isVerified ? "#16a34a" : "#dc2626",
        backgroundColor: isVerified ? "#f0fdf4" : "#fef2f2",
      }}>
      <h4
        style={{ ...styles.banner, color: isVerified ? "#16a34a" : "#dc2626" }}>
        {isVerified
          ? "✅ VERIFIED — File integrity confirmed"
          : "🚨 TAMPERED — File has been modified"}
      </h4>

      <div style={styles.hashRow}>
        <div style={styles.hashBlock}>
          <p style={styles.hashLabel}>Stored Hash</p>
          <code style={styles.hash}>{storedHash}</code>
        </div>
        <div style={styles.hashBlock}>
          <p style={styles.hashLabel}>Computed Hash</p>
          <code style={styles.hash}>
            {isVerified
              ? computedHash
              : highlightDiff(computedHash, storedHash)}
          </code>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    border: "2px solid",
    borderRadius: "10px",
    padding: "20px",
    marginTop: "16px",
  },
  banner: { margin: "0 0 16px", fontSize: "16px" },
  hashRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  hashBlock: { display: "flex", flexDirection: "column", gap: "6px" },
  hashLabel: {
    margin: 0,
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  hash: {
    fontFamily: "monospace",
    fontSize: "11px",
    color: "#1e293b",
    wordBreak: "break-all",
    lineHeight: "1.6",
  },
};

export default VerificationResult;
