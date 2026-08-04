import React from "react";
import { useAutomationStore } from "../../store/automationStore";

/**
 * Overview statistics and health cards for Automation Engine.
 * @component
 */
export default function AutomationStats() {
  const { stats, health } = useAutomationStore();

  const isPaused = health?.scheduler?.isPaused;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
      
      {/* Card 1: Total Rules */}
      <div className="card" style={{ padding: "16px", background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: "#2563eb15", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
          ⚙️
        </div>
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", color: "#6b7280" }}>Total Rules</div>
          <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--text-main)", marginTop: "2px" }}>{stats.totalRules || 0}</div>
        </div>
      </div>

      {/* Card 2: Active Rules */}
      <div className="card" style={{ padding: "16px", background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: "#16a34a15", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
          ⚡
        </div>
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", color: "#6b7280" }}>Active Rules</div>
          <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--text-main)", marginTop: "2px" }}>{stats.activeRules || 0}</div>
        </div>
      </div>

      {/* Card 3: Executions Executed */}
      <div className="card" style={{ padding: "16px", background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: "#9333ea15", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
          🔄
        </div>
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", color: "#6b7280" }}>Executions</div>
          <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--text-main)", marginTop: "2px" }}>{stats.totalExecutions || 0}</div>
        </div>
      </div>

      {/* Card 4: Scheduler Status */}
      <div className="card" style={{ padding: "16px", background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: isPaused ? "#dc262615" : "#16a34a15", color: isPaused ? "#dc2626" : "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
          {isPaused ? "⏸️" : "🟢"}
        </div>
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", color: "#6b7280" }}>Scheduler Engine</div>
          <div style={{ fontSize: "1.2rem", fontWeight: "700", color: isPaused ? "#dc2626" : "#16a34a", marginTop: "2px" }}>
            {isPaused ? "PAUSED" : "RUNNING"}
          </div>
        </div>
      </div>

    </div>
  );
}
