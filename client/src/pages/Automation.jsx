import React, { useState, useEffect } from "react";
import { useAutomationStore } from "../store/automationStore";
import AutomationStats from "../components/automation/AutomationStats";
import AutomationFilters from "../components/automation/AutomationFilters";
import AutomationTable from "../components/automation/AutomationTable";
import AutomationForm from "../components/automation/AutomationForm";
import ExecutionHistory from "../components/automation/ExecutionHistory";
import WorkflowBuilder from "../components/automation/WorkflowBuilder";
import SchedulerCalendar from "../components/automation/SchedulerCalendar";

/**
 * Enterprise Automation & Workflow Engine page.
 * @component
 */
export default function Automation() {
  const { fetchRules, fetchExecutions, fetchStatsAndHealth } = useAutomationStore();
  const [activeTab, setActiveTab] = useState("rules"); // "rules" | "executions"
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchRules(1);
    fetchExecutions(1);
    fetchStatsAndHealth();
  }, [fetchRules, fetchExecutions, fetchStatsAndHealth]);

  return (
    <section id="view-automation" className="view-section">
      <div className="view-header" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="view-title">
          <h1>Automation & Workflow Engine</h1>
          <p>Configure event-driven rules, scheduled background tasks, and automated notifications</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsFormOpen(true)}
        >
          + Create Automation Rule
        </button>
      </div>

      {/* Overview Cards */}
      <AutomationStats />

      {/* Scheduler Status Control */}
      <SchedulerCalendar />

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", marginBottom: "20px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("rules")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: "none",
            fontWeight: 600,
            fontSize: "0.9rem",
            color: activeTab === "rules" ? "var(--primary-color)" : "#6b7280",
            borderBottom: activeTab === "rules" ? "2px solid var(--primary-color)" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          Automation Rules
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("executions")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: "none",
            fontWeight: 600,
            fontSize: "0.9rem",
            color: activeTab === "executions" ? "var(--primary-color)" : "#6b7280",
            borderBottom: activeTab === "executions" ? "2px solid var(--primary-color)" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          Execution History & DLQ
        </button>
      </div>

      {activeTab === "rules" ? (
        <>
          <AutomationFilters />
          <AutomationTable />
        </>
      ) : (
        <ExecutionHistory />
      )}

      {/* Form modal */}
      <AutomationForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />

      {/* Inspector Drawer */}
      <WorkflowBuilder />
    </section>
  );
}
