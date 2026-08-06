import React, { useEffect, useState } from "react";
import * as emscpService from "../../services/supplyChainService";

export default function EnterpriseSupplyChainConsole() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [fleet, setFleet] = useState({ routes: [], vehicles: [] });
  const [suppliers, setSuppliers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Transfer Form State
  const [srcWh, setSrcWh] = useState("WH-MAIN-01");
  const [destWh, setDestWh] = useState("WH-COLD-01");
  const [prodCode, setProdCode] = useState("PROD-OIL-01");
  const [transferQty, setTransferQty] = useState(100);

  const loadData = async () => {
    setLoading(true);
    try {
      const [brRes, whRes, invRes, trRes, dspRes, fleetRes, supRes, anaRes] = await Promise.all([
        emscpService.getBranches(),
        emscpService.getWarehouses(),
        emscpService.getInventory(),
        emscpService.getTransfers(),
        emscpService.getDispatch(),
        emscpService.getRoutes(),
        emscpService.getSuppliers(),
        emscpService.getAnalytics(),
      ]);

      setBranches(brRes.data || brRes);
      setWarehouses(whRes.data || whRes);
      setInventory(invRes.data || invRes);
      setTransfers(trRes.data || trRes);
      setDispatches(dspRes.data || dspRes);
      setFleet(fleetRes.data || fleetRes);
      setSuppliers(supRes.data || supRes);
      setAnalytics(anaRes.data || anaRes);
    } catch (err) {
      console.error("Error loading supply chain telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    try {
      await emscpService.createTransfer({
        sourceWarehouse: srcWh,
        destinationWarehouse: destWh,
        items: [{ productCode: prodCode, quantity: Number(transferQty), uom: "Piece" }],
      });
      alert("Stock transfer initiated successfully!");
      loadData();
    } catch (err) {
      alert(`Transfer failed: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0, color: "#0f172a" }}>Enterprise Multi-Branch, Warehouse & Supply Chain Platform (EMSCP)</h1>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.9rem" }}>
            Multi-branch hierarchy, warehouse bin management, stock reservations, FEFO expiry tracking, sales dispatch, and fleet logistics
          </p>
        </div>

        <button onClick={loadData} className="btn btn-primary" style={{ fontWeight: "700" }}>
          🔄 Refresh Supply Chain Telemetry
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Active Warehouses</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0f172a" }}>{warehouses.length}</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Inventory Turnover</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#16a34a" }}>{analytics?.inventoryTurnoverRatio || 8.4} x</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Order Fill Rate</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#0284c7" }}>{analytics?.orderFillRatePct || 98.6}%</div>
        </div>
        <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Fleet Vehicles</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#8b5cf6" }}>{(fleet.vehicles || []).length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", marginBottom: "24px", overflowX: "auto" }}>
        {[
          { id: "inventory", label: "📦 Multi-Warehouse Stock & FEFO" },
          { id: "transfer", label: "🔄 Inter-Warehouse Transfers" },
          { id: "dispatch", label: "🚛 Sales Dispatch & Packing Lists" },
          { id: "fleet", label: "🚘 Vehicle Fleet & Delivery Routes" },
          { id: "suppliers", label: "⭐ Supplier Rating Center" },
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

      {/* TAB: Inventory */}
      {activeTab === "inventory" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Multi-Warehouse Inventory Ledger & FEFO Expiry Tracking</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Warehouse</th>
                  <th>Available Qty</th>
                  <th>Reserved Qty</th>
                  <th>Batch Number</th>
                  <th>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((inv) => (
                  <tr key={inv._id || inv.stockId}>
                    <td style={{ fontWeight: "700" }}>{inv.productName} ({inv.productCode})</td>
                    <td><span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700" }}>{inv.warehouseCode}</span></td>
                    <td style={{ fontWeight: "800", color: "#16a34a" }}>{inv.availableQty} {inv.uom}</td>
                    <td style={{ color: "#d97706", fontWeight: "700" }}>{inv.reservedQty} {inv.uom}</td>
                    <td style={{ fontSize: "0.85rem", color: "#64748b" }}>{inv.batchNumber || "B-DEFAULT"}</td>
                    <td style={{ fontSize: "0.85rem" }}>{inv.expiryDate ? new Date(inv.expiryDate).toLocaleDateString() : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Transfers */}
      {activeTab === "transfer" && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", fontWeight: "800" }}>Initiate Inter-Warehouse Stock Transfer</h3>
          <form onSubmit={handleCreateTransfer} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Source Warehouse</label>
              <select className="form-control" value={srcWh} onChange={(e) => setSrcWh(e.target.value)}>
                {warehouses.map((w) => (
                  <option key={w.warehouseCode} value={w.warehouseCode}>{w.warehouseCode} - {w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Destination Warehouse</label>
              <select className="form-control" value={destWh} onChange={(e) => setDestWh(e.target.value)}>
                {warehouses.map((w) => (
                  <option key={w.warehouseCode} value={w.warehouseCode}>{w.warehouseCode} - {w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Product SKU</label>
              <input type="text" className="form-control" value={prodCode} onChange={(e) => setProdCode(e.target.value)} required />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Transfer Quantity</label>
              <input type="number" className="form-control" value={transferQty} onChange={(e) => setTransferQty(e.target.value)} required />
            </div>

            <div style={{ gridColumn: "1 / -1", textAlign: "right" }}>
              <button type="submit" className="btn btn-primary" style={{ fontWeight: "700" }}>
                🚀 Dispatch Transfer Order
              </button>
            </div>
          </form>

          <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: "800" }}>Stock Transfers History</h4>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Transfer ID</th>
                  <th>Source</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Dispatched Date</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => (
                  <tr key={t._id || t.transferId}>
                    <td style={{ fontWeight: "800" }}>{t.transferId}</td>
                    <td>{t.sourceWarehouse}</td>
                    <td>{t.destinationWarehouse}</td>
                    <td><span style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>{t.status}</span></td>
                    <td style={{ fontSize: "0.85rem" }}>{new Date(t.dispatchedAt).toLocaleString()}</td>
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
