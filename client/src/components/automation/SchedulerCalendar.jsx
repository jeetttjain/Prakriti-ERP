import React from "react";
import { useAutomationStore } from "../../store/automationStore";
import { toggleScheduler } from "../../services/automationService";

/**
 * Scheduler Status and Health controls component.
 * @component
 */
export default function SchedulerCalendar() {
  const { health, fetchStatsAndHealth } = useAutomationStore();
  const isPaused = health?.scheduler?.isPaused;

  const handleToggleScheduler = async () => {
    try {
      await toggleScheduler(!isPaused);
      await fetchStatsAndHealth();
    } catch {
      // Ignore
    }
  };

  return (
    <div className="card" style={{ padding: "20px", background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "8px", marginBottom: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "700" }}>Background Scheduler & Queue Engine</h4>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "#6b7280" }}>
            Engine Adapter: <strong>{health?.queue?.adapter || "InMemoryQueueAdapter"}</strong> • Concurrency: <strong>{health?.queue?.concurrencyLimit || 5} workers</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span className={`badge ${isPaused ? "badge-danger" : "badge-success"}`} style={{ fontSize: "0.85rem", padding: "6px 12px" }}>
            {isPaused ? "PAUSED" : "ACTIVE"}
          </span>
          <button
            type="button"
            className={`btn ${isPaused ? "btn-success" : "btn-danger"} btn-sm`}
            onClick={handleToggleScheduler}
          >
            {isPaused ? "▶ Resume Scheduler" : "⏸ Pause Scheduler"}
          </button>
        </div>
      </div>
    </div>
  );
}
