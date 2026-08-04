/**
 * Reusable placeholder layout block for future system expansion modules.
 * @component
 * @param {Object} props Props
 * @param {string} props.title Module or feature name
 * @param {string} props.description Explanatory information
 */
export default function FeaturePlaceholder({ title, description }) {
  return (
    <div style={{ border: "1px dashed var(--border)", padding: "16px", borderRadius: "6px", background: "#f8fafc", textAlign: "center", color: "var(--text-light)" }}>
      <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>🔒</div>
      <h4 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "4px", color: "var(--text-main)" }}>{title}</h4>
      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>{description}</p>
    </div>
  );
}
