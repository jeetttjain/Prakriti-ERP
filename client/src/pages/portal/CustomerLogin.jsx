import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerPortalStore } from "../../store/customerPortalStore";
import { ROUTES } from "../../constants/routes";

/**
 * Customer portal login page.
 * @component
 */
export default function CustomerLogin() {
  const { loginCustomer, loginLoading, loginError, isLoggedIn } = useCustomerPortalStore();
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  // Already logged in — redirect
  if (isLoggedIn) {
    navigate(ROUTES.CUSTOMER_DASHBOARD, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await loginCustomer(mobile.trim(), password);
    if (ok) navigate(ROUTES.CUSTOMER_DASHBOARD, { replace: true });
  };

  return (
    <div className="cp-login-wrap">
      <div className="cp-login-card">
        <div className="cp-login-logo">🌿</div>
        <h1 className="cp-login-heading">Prakriti Portal</h1>
        <p className="cp-login-sub">B2B Customer Self-Service</p>

        {loginError && <div className="cp-alert-error">{loginError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="cp-input-group">
            <label htmlFor="cp-mobile" className="cp-input-label">Mobile Number</label>
            <input
              id="cp-mobile"
              type="tel"
              className="cp-input"
              placeholder="Enter registered mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              autoComplete="tel"
            />
          </div>
          <div className="cp-input-group">
            <label htmlFor="cp-password" className="cp-input-label">Password</label>
            <input
              id="cp-password"
              type="password"
              className="cp-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="cp-btn-primary" disabled={loginLoading}>
            {loginLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "0.72rem", color: "#9ca3af", marginTop: "20px" }}>
          Contact your supplier to activate portal access.
        </p>
      </div>
    </div>
  );
}
