import { AuditEvent, AuditEventType } from "shared/types";

interface Props {
  events: AuditEvent[];
}

const badgeConfig: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  [AuditEventType.SUBMITTED]: {
    label: "SUBMITTED",
    bg: "#2563eb",
    color: "#fff",
  },
  [AuditEventType.VERIFIED]: {
    label: "VERIFIED",
    bg: "#16a34a",
    color: "#fff",
  },
  [AuditEventType.TAMPER_DETECTED]: {
    label: "TAMPER DETECTED",
    bg: "#dc2626",
    color: "#fff",
  },
  [AuditEventType.ACCESSED]: {
    label: "ACCESSED",
    bg: "#94a3b8",
    color: "#fff",
  },
};

const formatDate = (date: Date | string) => {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(date));
};

const AuditTimeline = ({ events }: Props) => {
  if (events.length === 0) {
    return <p style={styles.empty}>No audit events recorded yet.</p>;
  }

  return (
    <div style={styles.container}>
      {events.map((event, index) => {
        const cfg = badgeConfig[event.eventType] || {
          label: event.eventType,
          bg: "#64748b",
          color: "#fff",
        };
        const isLast = index === events.length - 1;

        return (
          <div key={String(event.id || index)} style={styles.row}>
            {/* Left — timeline line and dot */}
            <div style={styles.lineCol}>
              <div style={{ ...styles.dot, backgroundColor: cfg.bg }} />
              {!isLast && <div style={styles.line} />}
            </div>

            {/* Right — event content */}
            <div style={{ ...styles.card, marginBottom: isLast ? 0 : "12px" }}>
              <div style={styles.cardHeader}>
                <span
                  style={{
                    ...styles.badge,
                    backgroundColor: cfg.bg,
                    color: cfg.color,
                  }}>
                  {cfg.label}
                </span>
                <span style={styles.timestamp}>
                  {formatDate(event.timestamp)}
                </span>
              </div>
              <p style={styles.actor}>
                <strong>{event.actorName}</strong>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: "8px 0" },
  empty: { color: "#94a3b8", fontSize: "14px", margin: 0 },
  row: { display: "flex", gap: "16px" },
  lineCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "16px",
    flexShrink: 0,
  },
  dot: {
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    flexShrink: 0,
    marginTop: "4px",
  },
  line: { width: "2px", flex: 1, backgroundColor: "#e2e8f0", marginTop: "4px" },
  card: {
    flex: 1,
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "12px 16px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
  },
  badge: {
    padding: "2px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "bold",
  },
  timestamp: { fontSize: "12px", color: "#64748b" },
  actor: { margin: "6px 0 0", fontSize: "13px", color: "#334155" },
};

export default AuditTimeline;
