import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { ROUTES } from "../constants/routes";

/**
 * Renders administration portal login layout screen.
 * @component
 */
export default function Login() {
  const { loginAdmin, error } = useAuthStore();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    const success = await loginAdmin(username.trim(), password);
    if (success) {
      navigate(ROUTES.DASHBOARD);
    } else {
      setErrorMsg("Invalid credentials. Please use USR-0001 / admin.");
    }
  };

  const handleShortcutClick = async () => {
    setUsername("USR-0001");
    setPassword("admin");
    setErrorMsg(null);
    const success = await loginAdmin("USR-0001", "admin");
    if (success) {
      navigate(ROUTES.DASHBOARD);
    }
  };

  return (
    <div className="login-outer" style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-img" style={{ display: "flex", margin: "0 auto 16px", alignItems: "center", justifyContent: "center", background: "#16a34a", color: "white", fontWeight: "bold", fontSize: "2rem", width: "70px", height: "70px", borderRadius: "16px" }}>
            P
          </div>
          <h1 className="login-title">Prakriti Vegetable Supplier</h1>
          <p className="login-subtitle">Wholesale Business Operating System (ERP)</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {(errorMsg || error) && (
            <div style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "16px", fontWeight: "500" }}>
              {error || errorMsg || "Invalid credentials."}
            </div>
          )}
          
          <button type="submit" className="btn btn-primary" style={{ width: "100%", fontSize: "1rem", padding: "12px 18px" }}>
            Log In to Dashboard
          </button>
        </form>
        
        <div className="demo-shortcut-box" onClick={handleShortcutClick} style={{ cursor: "pointer", marginTop: "16px", padding: "12px", border: "1px dashed var(--primary)", borderRadius: "6px", textAlign: "center", fontSize: "0.85rem", color: "var(--primary)", fontWeight: "600" }}>
          🚀 Click here to auto-fill credentials for demo (USR-0001 / admin)
        </div>
      </div>
    </div>
  );
}
