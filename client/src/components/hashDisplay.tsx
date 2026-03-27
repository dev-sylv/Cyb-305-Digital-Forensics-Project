import { useState } from "react";

interface Props {
  hash: string;
}

const HashDisplay = ({ hash }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.container}>
      <code style={styles.hash}>{hash}</code>
      <button onClick={handleCopy} style={styles.button}>
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "10px 14px",
  },
  hash: {
    fontFamily: "monospace",
    fontSize: "13px",
    color: "#334155",
    wordBreak: "break-all",
    flex: 1,
  },
  button: {
    padding: "4px 12px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    whiteSpace: "nowrap",
  },
};

export default HashDisplay;
