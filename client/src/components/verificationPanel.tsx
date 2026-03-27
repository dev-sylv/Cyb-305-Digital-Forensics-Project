import { useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { verifyEvidence } from "../services/evidenceService";
import VerificationResult from "./verificationResult";

interface VerifyResult {
  status: string;
  computedHash: string;
  storedHash: string;
  match: boolean;
}

interface Props {
  evidenceId: string;
  onVerified: (result: VerifyResult) => void;
}

const VerificationPanel = ({ evidenceId, onVerified }: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState("");

  const handleVerify = async () => {
    setLoading(true);
    setError("");
    setConflict("");
    setResult(null);
    try {
      const data = await verifyEvidence(evidenceId);
      setResult(data);
      onVerified(data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setConflict(
            err.response.data?.error || "Conflict of interest detected.",
          );
        } else {
          setError(err.response?.data?.error || "Verification failed");
        }
      } else {
        setError("Verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // Only verifiers see this panel
  if (user?.role !== "verifier") return null;

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Verification</h3>
      <button
        onClick={handleVerify}
        disabled={loading}
        style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}>
        {loading ? "Verifying..." : "Verify Evidence"}
      </button>

      {/* Conflict of interest warning — amber, not red */}
      {conflict && (
        <div style={styles.conflict}>
          <strong>⚠️ Conflict of Interest</strong>
          <p style={{ margin: "4px 0 0", fontSize: "13px" }}>{conflict}</p>
        </div>
      )}

      {/* General error */}
      {error && (
        <div style={styles.errorBox}>
          <p style={{ margin: 0, fontSize: "13px" }}>{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <VerificationResult
          status={result.status}
          computedHash={result.computedHash}
          storedHash={result.storedHash}
          match={result.match}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
    marginTop: "20px",
  },
  heading: { margin: "0 0 16px", fontSize: "16px", color: "#1e293b" },
  button: {
    padding: "10px 24px",
    backgroundColor: "#7c3aed",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },
  conflict: {
    marginTop: "16px",
    backgroundColor: "#fffbeb",
    border: "1px solid #d97706",
    borderRadius: "8px",
    padding: "14px",
    color: "#92400e",
  },
  errorBox: {
    marginTop: "16px",
    backgroundColor: "#fef2f2",
    border: "1px solid #dc2626",
    borderRadius: "8px",
    padding: "14px",
    color: "#dc2626",
  },
};

export default VerificationPanel;
