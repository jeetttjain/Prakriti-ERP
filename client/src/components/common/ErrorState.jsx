/**
 * Standard error state notification component.
 * @component
 * @param {Object} props Props
 * @param {string} [props.title="Network Error"] Error title
 * @param {string} props.message Main error details
 * @param {Function} [props.onRetry] Retry action handler callback
 */
export default function ErrorState({ title = "Network Synchronisation Error", message, onRetry }) {
  return (
    <div style={{ padding: "32px", textAlign: "center", border: "1px solid #fee2e2", borderRadius: "8px", background: "#fef2f2", color: "#991b1b" }}>
      <h4 style={{ fontWeight: "600", marginBottom: "8px", color: "#991b1b" }}>{title}</h4>
      <p style={{ fontSize: "0.9rem", marginBottom: "16px", color: "#b91c1c" }}>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry} style={{ borderColor: "#fca5a5" }}>
          Retry Request
        </button>
      )}
    </div>
  );
}
