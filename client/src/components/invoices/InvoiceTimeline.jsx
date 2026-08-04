/**
 * Displays status modification transitions timeline logs.
 * @component
 * @param {Object} props Props
 * @param {Array} props.timeline Array of timeline objects
 */
export default function InvoiceTimeline({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No timeline updates recorded.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderLeft: "2px solid var(--border)", paddingLeft: "16px", margin: "8px 0" }}>
      {timeline.map((event, idx) => (
        <div key={idx} style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: "-23px", top: "4px", width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "var(--primary)", border: "2px solid #ffffff" }}></div>
          <strong style={{ display: "block", fontSize: "0.85rem", color: "var(--text-main)" }}>
            Status: {event.status}
          </strong>
          <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {new Date(event.timestamp).toLocaleString("en-IN")} {event.updatedBy ? `by ${event.updatedBy}` : ""}
          </span>
          {event.notes && (
            <span style={{ display: "block", fontSize: "0.8rem", color: "var(--text-light)", fontStyle: "italic", marginTop: "2px" }}>
              "{event.notes}"
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
