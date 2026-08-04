import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useCustomerStore } from "../store/customerStore";
import CartSummary from "../components/CartSummary";
import OTPVerificationModal from "../components/OTPVerificationModal";
import MobileBottomNav from "../components/MobileBottomNav";

export default function Cart() {
  const navigate = useNavigate();
  const { cart, isAuthenticated } = useCustomerStore();
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      setIsOTPModalOpen(true);
    } else {
      navigate(ROUTES.CHECKOUT);
    }
  };

  const handleVerified = () => {
    navigate(ROUTES.CHECKOUT);
  };

  return (
    <div style={{ padding: "16px", paddingBottom: "80px" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700" }}>Your Wholesale Cart</h3>

      <CartSummary />

      {cart.length > 0 && (
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: "100%", padding: "14px", fontSize: "1rem", marginTop: "20px" }}
          onClick={handleCheckoutClick}
        >
          Proceed to OTP Verification & Checkout →
        </button>
      )}

      <OTPVerificationModal
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        onVerified={handleVerified}
      />

      <MobileBottomNav />
    </div>
  );
}
