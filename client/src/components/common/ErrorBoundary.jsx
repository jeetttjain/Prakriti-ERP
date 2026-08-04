import React from "react";

/**
 * Global component boundary preventing view crashes and rendering fallbacks.
 * @component
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px", background: "#f8fafc", fontFamily: "sans-serif" }}>
          <div style={{ maxWidth: "500px", width: "100%", background: "#fff", border: "1px solid #e2e8f0", padding: "32px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <h1 style={{ color: "#ef4444", fontSize: "1.5rem", marginBottom: "12px", fontWeight: "700" }}>System Interrupted</h1>
            <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: "1.5", marginBottom: "20px" }}>
              An unexpected error occurred in the application rendering engine. Please refresh or contact support if the issue persists.
            </p>
            <div style={{ background: "#f1f5f9", padding: "12px 16px", borderRadius: "6px", fontSize: "0.85rem", color: "#64748b", fontFamily: "monospace", overflowX: "auto", marginBottom: "24px" }}>
              {this.state.error?.toString() || "Unknown Error"}
            </div>
            <button
              style={{ background: "#16a34a", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", transition: "background 0.2s" }}
              onClick={() => window.location.reload()}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
