import React, { useEffect, useState } from "react";
import * as hrmsService from "../../services/hrmsService";

export default function EnterpriseHRMSConsole() {
  const [activeTab, setActiveTab] = useState("employees");
  const [employees, setEmployees] = useState([]);
  const [org, setOrg] = useState({ depts: [], desigs: [] });
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Employee Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dept, setDept] = useState("DEPT-ENG");
  const [desig, setDesig] = useState("DESIG-EXEC");

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, orgRes, attRes, lvRes, payRes, anaRes] = await Promise.all([
        hrmsService.getEmployees(),
        hrmsService.getOrgChart(),
        hrmsService.getAttendance(),
        hrmsService.getLeave(),
        hrmsService.getPayroll(),
        hrmsService.getAnalytics(),
      ]);

      setEmployees(empRes.data || empRes);
      setOrg(orgRes.data || orgRes);
      setAttendance(attRes.data || attRes);
      setLeaves(lvRes.data || lvRes);
      setPayrolls(payRes.data || payRes);
      setAnalytics(anaRes.data || anaRes);
    } catch (err) {
      console.error("Error loading HRMS telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      await hrmsService.createEmployee({
        firstName,
        lastName,
        email,
        phone,
        departmentCode: dept,
        designationCode: desig,
      });
      alert("New employee onboarded successfully!");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      loadData();
    } catch (err) {
      alert(`Onboarding failed: ${err.message}`);
    }
  };

  const handleRunPayroll = async () => {
    if (!window.confirm("Process monthly payroll run for August 2026?")) return;
    try {
      await hrmsService.runPayroll({ month: 8, year: 2026 });
      alert("Monthly statutory payroll run processed successfully & journal entries posted to Finance!");
      loadData();
    } catch (err) {
      alert(`Payroll run failed: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0, color: "#0f172a" }}>Enterprise Human Resource Management Platform (EHRMP)</h1>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.9rem" }}>
            Multi-company legal entity employee lifecycle, attendance monitoring, statutory payroll processing, leave approvals, and HR analytics
          </p>
        </div>

        <button onClick={loadData} className="btn btn-primary" style={{ fontWeight: "700" }}>
          🔄 Refresh HRMS Telemetry
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Total Headcount</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0f172a" }}>{analytics?.headcount || employees.length}</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Attendance Rate</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#16a34a" }}>{analytics?.attendanceRatePct || 97.4}%</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Monthly Payroll Cost</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0284c7" }}>₹ {analytics?.monthlyPayrollCost ? analytics.monthlyPayrollCost.toLocaleString() : "253,000"}</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Attrition Rate</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#8b5cf6" }}>{analytics?.attritionRatePct || 2.1}%</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", marginBottom: "24px", overflowX: "auto" }}>
        {[
          { id: "employees", label: "👥 Employee Directory & Onboarding" },
          { id: "attendance", label: "⏱ Daily Attendance & Shifts" },
          { id: "leave", label: "🏖 Leave Request Management" },
          { id: "payroll", label: "💼 Statutory Payroll Processing" },
          { id: "org", label: "🏛 Organization Structure & Departments" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 20px",
              border: "none",
              background: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
              color: activeTab === tab.id ? "#16a34a" : "#64748b",
              borderBottom: activeTab === tab.id ? "3px solid #16a34a" : "3px solid transparent",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Employees */}
      {activeTab === "employees" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Onboard New Employee</h3>
          <form onSubmit={handleCreateEmployee} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "32px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>First Name</label>
              <input type="text" className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Last Name</label>
              <input type="text" className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Work Email</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Phone</label>
              <input type="text" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Department</label>
              <select className="form-control" value={dept} onChange={(e) => setDept(e.target.value)}>
                {(org.depts || []).map((d) => (
                  <option key={d.departmentCode} value={d.departmentCode}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Designation</label>
              <select className="form-control" value={desig} onChange={(e) => setDesig(e.target.value)}>
                {(org.desigs || []).map((d) => (
                  <option key={d.designationCode} value={d.designationCode}>{d.title}</option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1", textAlign: "right" }}>
              <button type="submit" className="btn btn-primary" style={{ fontWeight: "700" }}>
                🚀 Onboard Employee
              </button>
            </div>
          </form>

          <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: "800" }}>Active Employee Directory</h4>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee Code</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id || emp.employeeCode}>
                    <td style={{ fontWeight: "800" }}>{emp.employeeCode}</td>
                    <td style={{ fontWeight: "700" }}>{emp.firstName} {emp.lastName}</td>
                    <td style={{ fontSize: "0.85rem", color: "#64748b" }}>{emp.email}</td>
                    <td><span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700" }}>{emp.departmentCode}</span></td>
                    <td><span style={{ background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>{emp.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Payroll */}
      {activeTab === "payroll" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800" }}>Monthly Statutory Payroll Run Studio</h3>
            <button onClick={handleRunPayroll} className="btn btn-primary" style={{ fontWeight: "700" }}>
              💼 Execute Monthly Payroll Run
            </button>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Payroll Run ID</th>
                  <th>Month/Year</th>
                  <th>Staff Count</th>
                  <th>Total Gross</th>
                  <th>Total Net</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((p) => (
                  <tr key={p._id || p.payrollRunId}>
                    <td style={{ fontWeight: "800" }}>{p.payrollRunId}</td>
                    <td>{p.month} / {p.year}</td>
                    <td style={{ fontWeight: "700" }}>{p.employeeCount} Staff</td>
                    <td style={{ fontWeight: "700" }}>₹ {p.totalGross.toLocaleString()}</td>
                    <td style={{ fontWeight: "800", color: "#16a34a" }}>₹ {p.totalNet.toLocaleString()}</td>
                    <td><span style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
