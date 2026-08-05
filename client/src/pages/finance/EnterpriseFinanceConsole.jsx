import React, { useEffect, useState } from "react";
import * as efapService from "../../services/financeService";

export default function EnterpriseFinanceConsole() {
  const [activeTab, setActiveTab] = useState("accounts");
  const [accounts, setAccounts] = useState([]);
  const [journals, setJournals] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [reports, setReports] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Journal Form State
  const [narration, setNarration] = useState("");
  const [debitAcc, setDebitAcc] = useState("1001");
  const [creditAcc, setCreditAcc] = useState("4000");
  const [amount, setAmount] = useState(5000);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accRes, jrnRes, legRes, repRes, bdgRes, astRes] = await Promise.all([
        efapService.getAccounts(),
        efapService.getJournals(),
        efapService.getLedger(),
        efapService.getReports(),
        efapService.getBudgets(),
        efapService.getAssets(),
      ]);

      setAccounts(accRes.data || accRes);
      setJournals(jrnRes.data || jrnRes);
      setLedger(legRes.data || legRes);
      setReports(repRes.data || repRes);
      setBudgets(bdgRes.data || bdgRes);
      setAssets(astRes.data || astRes);
    } catch (err) {
      console.error("Error loading finance telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePostJournal = async (e) => {
    e.preventDefault();
    try {
      const lines = [
        { accountCode: debitAcc, debit: Number(amount), credit: 0, description: narration },
        { accountCode: creditAcc, debit: 0, credit: Number(amount), description: narration },
      ];
      await efapService.postJournal({ narration, lines });
      alert("Double-entry journal posted successfully!");
      setNarration("");
      loadData();
    } catch (err) {
      alert(`Journal posting failed: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0, color: "#0f172a" }}>Enterprise Finance & Accounting Console (EFAP)</h1>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.9rem" }}>
            Double-entry general ledger, chart of accounts, AR/AP, Indian GST, financial KPIs, and reporting engine
          </p>
        </div>

        <button onClick={loadData} className="btn btn-primary" style={{ fontWeight: "700" }}>
          🔄 Refresh Financial Telemetry
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Total Revenue</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#16a34a" }}>₹{(reports?.pnl?.totalRevenue || 0).toLocaleString()}</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Net Profit</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0284c7" }}>₹{(reports?.pnl?.netProfit || 0).toLocaleString()}</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>AR Outstanding</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#d97706" }}>₹{(reports?.ar?.totalOutstanding || 0).toLocaleString()}</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>EBITDA Margin</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#8b5cf6" }}>{reports?.kpis?.grossMarginPct || 48.5}%</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", marginBottom: "24px", overflowX: "auto" }}>
        {[
          { id: "accounts", label: "📊 Chart of Accounts" },
          { id: "journal", label: "📝 Post Double-Entry Journal" },
          { id: "ledger", label: "📖 General Ledger" },
          { id: "reports", label: "📑 Financial Reports (P&L, Balance Sheet)" },
          { id: "budget", label: "🎯 Budgets & Fixed Assets" },
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

      {/* TAB: Chart of Accounts */}
      {activeTab === "accounts" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Chart of Accounts Directory</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Account Name</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Balance (₹)</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => (
                  <tr key={acc.accountCode}>
                    <td style={{ fontWeight: "800", color: "#0f172a" }}>{acc.accountCode}</td>
                    <td style={{ fontWeight: "700" }}>{acc.accountName}</td>
                    <td><span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700" }}>{acc.type}</span></td>
                    <td style={{ fontSize: "0.85rem", color: "#64748b" }}>{acc.category}</td>
                    <td style={{ fontWeight: "800", color: acc.balance >= 0 ? "#16a34a" : "#dc2626" }}>₹{acc.balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Post Double Entry Journal */}
      {activeTab === "journal" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Post Double-Entry Journal Entry</h3>
          <form onSubmit={handlePostJournal} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Narration / Description</label>
              <input type="text" className="form-control" value={narration} onChange={(e) => setNarration(e.target.value)} required placeholder="e.g. Received customer payment for Invoice INV-1002" />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Debit Account (Dr)</label>
              <select className="form-control" value={debitAcc} onChange={(e) => setDebitAcc(e.target.value)}>
                {accounts.map((a) => (
                  <option key={a.accountCode} value={a.accountCode}>{a.accountCode} - {a.accountName}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Credit Account (Cr)</label>
              <select className="form-control" value={creditAcc} onChange={(e) => setCreditAcc(e.target.value)}>
                {accounts.map((a) => (
                  <option key={a.accountCode} value={a.accountCode}>{a.accountCode} - {a.accountName}</option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Balanced Amount (₹)</label>
              <input type="number" className="form-control" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>

            <div style={{ gridColumn: "1 / -1", textAlign: "right" }}>
              <button type="submit" className="btn btn-primary" style={{ fontWeight: "700" }}>
                ✅ Validate & Post Journal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB: Financial Reports */}
      {activeTab === "reports" && reports && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Profit & Loss Statement (P&L)</h3>
            <div style={{ fontSize: "0.9rem", display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span>Total Operating Revenue:</span>
              <strong style={{ color: "#16a34a" }}>₹{(reports.pnl?.totalRevenue || 0).toLocaleString()}</strong>
            </div>
            <div style={{ fontSize: "0.9rem", display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span>Total Operating Expenses:</span>
              <strong style={{ color: "#dc2626" }}>₹{(reports.pnl?.totalExpenses || 0).toLocaleString()}</strong>
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", justifyContent: "space-between", padding: "12px 0", marginTop: "12px", borderTop: "2px solid #e2e8f0" }}>
              <span>NET PROFIT:</span>
              <span style={{ color: "#0284c7" }}>₹{(reports.pnl?.netProfit || 0).toLocaleString()}</span>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Balance Sheet Summary</h3>
            <div style={{ fontSize: "0.9rem", display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span>Total Assets:</span>
              <strong style={{ color: "#16a34a" }}>₹{(reports.bs?.totalAssets || 0).toLocaleString()}</strong>
            </div>
            <div style={{ fontSize: "0.9rem", display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span>Total Liabilities:</span>
              <strong style={{ color: "#d97706" }}>₹{(reports.bs?.totalLiabilities || 0).toLocaleString()}</strong>
            </div>
            <div style={{ fontSize: "0.9rem", display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span>Total Owner Equity:</span>
              <strong>₹{(reports.bs?.totalEquity || 0).toLocaleString()}</strong>
            </div>
            <div style={{ fontSize: "0.85rem", marginTop: "12px", textAlign: "right", color: reports.bs?.isBalanced ? "#16a34a" : "#dc2626", fontWeight: "700" }}>
              {reports.bs?.isBalanced ? "🟢 Balance Sheet Balanced (Assets = Liabilities + Equity)" : "🔴 Balance Sheet Unbalanced"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
