import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <Link to="/evidence" style={styles.brand}>
          ChainLock
        </Link>
        <Link to="/evidence" style={styles.link}>
          All Evidence
        </Link>
        <Link to="/upload" style={styles.link}>
          Upload Evidence
        </Link>
      </div>
      {user && (
        <div style={styles.right}>
          <span style={styles.name}>{user.fullName}</span>
          <span
            style={{
              ...styles.badge,
              backgroundColor: roleColors[user.role] || "#6b7280",
            }}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
          <button onClick={handleLogout} style={styles.logout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

const roleColors: Record<string, string> = {
  submitter: "#2563eb",
  verifier: "#7c3aed",
  admin: "#dc2626",
};

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
    backgroundColor: "#1e293b",
    color: "#fff",
  },
  left: { display: "flex", alignItems: "center", gap: "24px" },
  brand: {
    color: "#38bdf8",
    fontWeight: "bold",
    fontSize: "20px",
    textDecoration: "none",
  },
  link: { color: "#cbd5e1", textDecoration: "none", fontSize: "14px" },
  right: { display: "flex", alignItems: "center", gap: "12px" },
  name: { fontSize: "14px", color: "#e2e8f0" },
  badge: {
    padding: "2px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    color: "#fff",
    fontWeight: "bold",
  },
  logout: {
    padding: "6px 14px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
};

export default NavBar;
