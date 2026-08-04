import { useEffect, useState } from "react";
import * as orderService from "../../services/customerOrderService";

const TYPES = ["Question", "Complaint", "Suggestion"];

const typeClass = (t) => {
  if (t === "Question") return "cp-ticket-question";
  if (t === "Complaint") return "cp-ticket-complaint";
  return "cp-ticket-suggestion";
};

const typeIcon = (t) => ({ Question: "❓", Complaint: "😔", Suggestion: "💡" })[t] || "📋";

const statusBadge = (s) => {
  const map = { Open: "cp-badge-warning", "In Progress": "cp-badge-info", Resolved: "cp-badge-success", Closed: "cp-badge-neutral" };
  return map[s] || "cp-badge-neutral";
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/**
 * Support page — submit a ticket and view ticket history.
 * @component
 */
export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ type: "Question", subject: "", message: "" });

  const loadTickets = async () => {
    try {
      const res = await orderService.getSupportTickets();
      const data = res.data || res;
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      setError("Subject and message are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await orderService.submitSupportTicket(form);
      setSuccess(true);
      setForm({ type: "Question", subject: "", message: "" });
      await loadTickets();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="cp-section-title" style={{ fontSize: "1rem", marginBottom: 14 }}>Help & Support</h1>

      {/* Submit Form */}
      <div className="cp-card" style={{ marginBottom: 18 }}>
        <p className="cp-section-title" style={{ marginBottom: 12 }}>Submit a Request</p>

        {success && (
          <div className="cp-alert-info" style={{ background: "#dcfce7", color: "#15803d", borderColor: "#86efac", marginBottom: 12 }}>
            ✅ Your request has been submitted. We'll respond shortly.
          </div>
        )}
        {error && (
          <div className="cp-alert-info" style={{ background: "#fee2e2", color: "#dc2626", borderColor: "#fca5a5", marginBottom: 12 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Type</label>
          <div className="cp-support-type-row">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`cp-support-type-chip ${form.type === t ? "active" : ""}`}
                onClick={() => setForm((f) => ({ ...f, type: t }))}
              >
                {typeIcon(t)} {t}
              </button>
            ))}
          </div>

          <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Subject</label>
          <input
            className="cp-search-input"
            style={{ borderRadius: 10, paddingLeft: 14, marginBottom: 12 }}
            placeholder="Brief subject…"
            value={form.subject}
            maxLength={200}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          />

          <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Message</label>
          <textarea
            className="cp-textarea"
            placeholder="Describe your issue or suggestion in detail…"
            value={form.message}
            maxLength={2000}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          />
          <p style={{ fontSize: "0.65rem", color: "#9ca3af", textAlign: "right", margin: "4px 0 12px" }}>
            {form.message.length}/2000
          </p>

          <button
            type="submit"
            className="cp-add-btn"
            style={{ padding: "12px", borderRadius: 10, fontSize: "0.85rem" }}
            disabled={submitting}
          >
            {submitting ? "Submitting…" : "Submit Request"}
          </button>
        </form>
      </div>

      {/* Ticket History */}
      <p className="cp-section-title" style={{ marginBottom: 10 }}>My Tickets ({tickets.length})</p>
      {loading ? (
        <div className="cp-empty"><div className="cp-empty-icon">⏳</div>Loading…</div>
      ) : tickets.length === 0 ? (
        <div className="cp-empty"><div className="cp-empty-icon">📋</div>No tickets yet</div>
      ) : (
        tickets.map((t) => (
          <div key={t._id} className="cp-ticket-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span className={`cp-ticket-type ${typeClass(t.type)}`}>{typeIcon(t.type)} {t.type}</span>
                <p className="cp-ticket-subject">{t.subject}</p>
              </div>
              <span className={`cp-badge ${statusBadge(t.status)}`}>{t.status}</span>
            </div>
            <p className="cp-ticket-msg">{t.message}</p>
            <p style={{ fontSize: "0.65rem", color: "#9ca3af" }}>#{t.ticketNumber} · {fmtDate(t.createdAt)}</p>
            {t.adminReply && (
              <div className="cp-ticket-reply">
                <strong>Support Reply:</strong> {t.adminReply}
              </div>
            )}
          </div>
        ))
      )}
    </>
  );
}
