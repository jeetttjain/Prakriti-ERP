import { useEffect } from "react";

/**
 * Standard universal confirmation dialog modal.
 * @component
 * @param {Object} props Props
 * @param {boolean} props.isOpen Checks overlay visibility
 * @param {string} props.title Dialog header label
 * @param {string} props.message Dialog detail message
 * @param {string} [props.confirmText="Confirm"] Confirmation button text
 * @param {string} [props.cancelText="Cancel"] Cancel button text
 * @param {string} [props.variant="primary"] Button variant ("primary" | "danger" | "warning")
 * @param {boolean} [props.isLoading=false] Loading state for pending async actions
 * @param {Function} props.onConfirm Confirmation trigger callback
 * @param {Function} props.onCancel Discard trigger callback
 */
export default function ConfirmationModal({
  isOpen,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const btnClass = variant === "danger" ? "btn btn-danger" : variant === "warning" ? "btn btn-warning" : "btn btn-primary";

  return (
    <div className="confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div className="confirm-box">
        <div className="confirm-header">
          <h3 id="confirm-modal-title" className="confirm-title">{title}</h3>
          <button
            type="button"
            className="btn-close"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "var(--text-light)" }}
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        <div className="confirm-body">
          <p>{message}</p>
        </div>
        <div className="confirm-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Cancel request"
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={btnClass}
            onClick={onConfirm}
            disabled={isLoading}
            aria-label="Confirm and apply changes"
            autoFocus
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
