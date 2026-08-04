import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { sendOTP, verifyOTP } from "../services/customerService";
import { useCustomerStore } from "../store/customerStore";

export default function CustomerLogin() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("123456");
  const [step, setStep] = useState("MOBILE"); // "MOBILE" | "OTP"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendOTP(mobile);
      setStep("OTP");
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await verifyOTP(mobile, otp);
      useCustomerStore.setState({ isAuthenticated: true });
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px" }}>
      <div style={{ background: "#ffffff", padding: "28px", borderRadius: "12px", border: "1px solid #e2e8f0", width: "100%", maxWidth: "360px", boxSizing: "border-box" }}>
        <h2 style={{ margin: "0 0 8px 0", fontSize: "1.3rem", fontWeight: "700" }}>Mobile OTP Login</h2>
        <p style={{ margin: "0 0 20px 0", fontSize: "0.8rem", color: "#64748b" }}>Enter your registered mobile number to receive a 6-digit OTP code.</p>

        {error && <div style={{ color: "#dc2626", background: "#fef2f2", padding: "8px", borderRadius: "6px", fontSize: "0.8rem", marginBottom: "12px" }}>{error}</div>}

        {step === "MOBILE" ? (
          <form onSubmit={handleSendOTP}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>Mobile Number</label>
              <input type="tel" className="form-control" placeholder="10-digit mobile number" required value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px" }} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "12px" }}>OTP sent to <strong>{mobile}</strong> (Test OTP: <strong>123456</strong>)</p>
            <div style={{ marginBottom: "16px" }}>
              <input type="text" className="form-control" placeholder="123456" required value={otp} onChange={(e) => setOtp(e.target.value)} style={{ textAlign: "center", letterSpacing: "4px", fontSize: "1.2rem", fontWeight: "700" }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px" }} disabled={loading}>
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
          </form>
        )}

        <button type="button" className="btn btn-secondary" style={{ width: "100%", marginTop: "12px" }} onClick={() => navigate(ROUTES.QR_LANDING)}>
          ← Back to QR Scan
        </button>
      </div>
    </div>
  );
}
