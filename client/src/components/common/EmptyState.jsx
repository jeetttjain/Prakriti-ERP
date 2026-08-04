/**
 * Renders a standardized friendly blank state view.
 * @component
 * @param {Object} props Props
 * @param {string} props.message Empty state message to display
 * @param {Function} [props.onAction] Optional action callback
 * @param {string} [props.actionText] Optional action button label
 */
export default function EmptyState({ message, onAction, actionText }) {
  return (
    <div className="table-container" style={{ padding: "48px", textAlign: "center", color: "var(--text-light)" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "16px", color: "var(--text-muted)" }}>📭</div>
      <p style={{ margin: "0 0 16px 0", fontSize: "0.95rem" }}>{message}</p>
      {onAction && actionText && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}
