interface Props {
  status: string;
}

const config: Record<string, { label: string; bg: string; color: string }> = {
  unverified: { label: "Unverified", bg: "#e2e8f0", color: "#475569" },
  verified: { label: "Verified", bg: "#16a34a", color: "#fff" },
  tampered: { label: "Tampered", bg: "#dc2626", color: "#fff" },
};

const IntegrityBadge = ({ status }: Props) => {
  const cfg = config[status] || config["unverified"];
  return (
    <span
      style={{
        padding: "3px 12px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "bold",
        backgroundColor: cfg.bg,
        color: cfg.color,
      }}>
      {cfg.label}
    </span>
  );
};

export default IntegrityBadge;
