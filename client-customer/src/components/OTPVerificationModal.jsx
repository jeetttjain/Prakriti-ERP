import React, { useState } from "react";
import { sendOTP, verifyOTP } from "../services/customerService";

/**
 * Mobile OTP verification modal before placing an order or logging in.
 * @component
 */
export default function OTPVerificationModal({ isOpen, onClose, onVerified, initialMobile = "" }) {
  const [mobile, setMobile] = useState(initialMobile);
  const [otp, setOtp] = useState("123456");
  const [step, setStep] = useState(initialMobile ? "OTP" : "MOBILE"); // "MOBILE" | "OTP"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

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
      const data = await verifyOTP(mobile, otp);
      setLoading(false);
      onVerified(data);
      onClose();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: "16px" }}>
      <div style={{ background: "#ffffff", width: "100%", maxWidth: "380px", borderRadius: "12px", padding: "24px", boxSizing: "border-box" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700" }}>
            {step === "MOBILE" ? "Mobile Verification" : "Enter OTP Code"}
          </h3>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
        </div>

        {error && <div style={{ color: "#dc2626", background: "#fef2f2", padding: "8px", borderRadius: "6px", fontSize: "0.8rem", marginBottom: "12px" }}>{error}</div>}

        {step === "MOBILE" ? (
          <form onSubmit={handleSendOTP}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>Mobile Number</label>
              <input
                type="tel"
                className="form-control"
                placeholder="Enter 10-digit mobile number"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px" }} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "12px" }}>
              We sent a 6-digit OTP code to <strong>{mobile}</strong>. (Test OTP: <strong>123456</strong>)
            </p>
            <div style={{ marginBottom: "16px" }}>
              <input
                type="text"
                className="form-control"
                placeholder="123456"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ textAlign: "center", letterSpacing: "4px", fontSize: "1.2rem", fontWeight: "700" }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px" }} disabled={loading}>
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
