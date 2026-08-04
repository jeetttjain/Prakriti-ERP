import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useReportStore } from "../store/reportStore";
import DateRangeFilter from "../components/reports/DateRangeFilter";
import ReportFilters from "../components/reports/ReportFilters";
import SavedReportFilters from "../components/reports/SavedReportFilters";
import ChartContainer from "../components/reports/ChartContainer";
import ExportButtons from "../components/reports/ExportButtons";

/**
 * Main Reports & Business Intelligence dashboard component view.
 * Integrates customized SVG charts, local view saves, and auto-refresh loops.
 * @component
 */
export default function Reports() {
  const {
    selectedReport,
    setSelectedReport,
    loading,
    error,
    reportData,
    filters,
    fetchReportData,
    autoRefreshInterval,
  } = useReportStore();

  const refreshTimerRef = useRef(null);

  // Initial load
  useEffect(() => {
    fetchReportData();
  }, [selectedReport]);

  // Handle Auto Refresh timers
  useEffect(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    if (autoRefreshInterval === "Off") return;

    let ms = 30000;
    if (autoRefreshInterval === "1m") ms = 60000;
    if (autoRefreshInterval === "5m") ms = 300000;

    refreshTimerRef.current = setInterval(() => {
      fetchReportData();
    }, ms);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefreshInterval, selectedReport, filters]);

  const tabs = [
    { id: "dashboard", label: "Dashboard Summary" },
    { id: "sales", label: "Sales Analytics" },
    { id: "purchase", label: "Purchases" },
    { id: "inventory", label: "Inventory Valuation" },
    { id: "customer", label: "Customers Stats" },
    { id: "supplier", label: "Suppliers Performance" },
    { id: "payment", label: "Collections" },
    { id: "outstanding", label: "Outstanding Receivables" },
    { id: "product", label: "Products Performance" },
  ];

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val || 0);
  };

  return (
    <section id="view-reports" className="view-section">
      <div className="view-header">
        <div className="view-title">
          <h1>Reports & Business Intelligence</h1>
          <p>Consolidated data aggregations, pipeline metrics, and system auditing logs</p>
        </div>
      </div>

      {/* Tabs Selector Navigation */}
      <div style={{ display: "flex", overflowX: "auto", borderBottom: "1px solid var(--border-color)", marginBottom: "20px", gap: "10px", paddingBottom: "4px" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`filter-tab ${selectedReport === t.id ? "active" : ""}`}
            style={{
              padding: "10px 16px",
              background: "none",
              border: "none",
              borderBottom: selectedReport === t.id ? "2px solid var(--primary-color)" : "none",
              color: selectedReport === t.id ? "var(--primary-color)" : "#4b5563",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "0.85rem",
              whiteSpace: "nowrap",
            }}
            onClick={() => setSelectedReport(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Date Filters & Presets panel */}
      <DateRangeFilter />
      <SavedReportFilters />
      <ReportFilters />

      {/* Error alert */}
      {error && (
        <div style={{ marginBottom: "20px", padding: "12px 16px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", border: "1px solid #fee2e2" }}>
          <strong>Error running report:</strong> {error}
        </div>
      )}

      {/* Loading state skeleton */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "40px", textAlign: "center", color: "#6b7280" }}>
          <div className="loading-spinner" style={{ margin: "0 auto 10px auto" }} />
          Processing aggregation pipelines...
        </div>
      )}

      {/* Report Data display */}
      {!loading && reportData && (
        <div>
          {/* Dashboard Summary view */}
          {selectedReport === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: "600" }}>Total Customers</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: "800", marginTop: "4px" }}>{reportData.summary?.totalCustomers}</div>
                  <div style={{ fontSize: "0.75rem", color: "#10b981", marginTop: "4px" }}>{reportData.summary?.activeCustomers} active accounts</div>
                </div>
                <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: "600" }}>Suppliers & Partners</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: "800", marginTop: "4px" }}>{reportData.summary?.totalSuppliers}</div>
                </div>
                <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: "600" }}>Stock Value Valuation</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: "800", marginTop: "4px" }}>{formatCurrency(reportData.summary?.currentInventoryValue)}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "4px" }}>{reportData.summary?.totalInventoryItems} catalog SKU nodes</div>
                </div>
                <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: "600" }}>Gross Revenue</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: "800", marginTop: "4px" }}>{formatCurrency(reportData.summary?.totalRevenue)}</div>
                  <div style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "4px" }}>{formatCurrency(reportData.summary?.outstandingInvoices)} outstanding dues</div>
                </div>
              </div>
            </div>
          )}

          {/* Sales Report view */}
          {selectedReport === "sales" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "16px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Sales Value</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>{formatCurrency(reportData.summary?.salesTotal)}</div>
                </div>
                <div style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "16px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Order Volume</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>{reportData.summary?.orderCount}</div>
                </div>
                <div style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "16px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Avg Ticket Value</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>{formatCurrency(reportData.summary?.averageOrderValue)}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <ChartContainer title="Daily Sales Trend Line" type="line" data={reportData.charts?.dailyTrend} />
                <ChartContainer title="Monthly Sales Trend Bar" type="bar" data={reportData.charts?.monthlyTrend} />
              </div>

              <div className="table-responsive" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "#fff" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order Code</th>
                      <th>Customer Name</th>
                      <th>Order Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.tables?.ordersList || []).map((o) => (
                      <tr key={o._id}>
                        <td><Link to={`/orders/${o._id}`} style={{ fontWeight: "600", color: "var(--primary-color)" }}>{o.orderNumber}</Link></td>
                        <td>{o.customerSnapshot?.businessName}</td>
                        <td>{new Date(o.orderDate).toLocaleDateString()}</td>
                        <td>{formatCurrency(o.grandTotal)}</td>
                        <td><span className={`badge badge-${o.orderStatus === "Delivered" ? "success" : "warning"}`}>{o.orderStatus}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Purchase Report view */}
          {selectedReport === "purchase" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "16px", borderRadius: "8px", maxWidth: "240px" }}>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Purchase Value</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>{formatCurrency(reportData.summary?.purchaseTotal)}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <ChartContainer title="Purchase Trend Area" type="area" data={reportData.charts?.purchaseTrend} />
                <ChartContainer title="Supplier Wise Purchases Share" type="donut" data={reportData.charts?.supplierWise} />
              </div>

              <div className="table-responsive" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "#fff" }}>
                <h4 style={{ margin: "14px 16px 8px 16px", fontWeight: "700", fontSize: "0.9rem" }}>Product Wise Purchases Summary</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Quantity Purchased</th>
                      <th>Total Value Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.tables?.productWise || []).map((p, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: "600" }}>{p._id}</td>
                        <td>{p.quantity}</td>
                        <td>{formatCurrency(p.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Inventory Report view */}
          {selectedReport === "inventory" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "16px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Stock Value</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>{formatCurrency(reportData.summary?.inventoryValue)}</div>
                </div>
                <div style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "16px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Low Stock items</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#eab308" }}>{reportData.summary?.lowStockCount}</div>
                </div>
                <div style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "16px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Out of Stock items</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#ef4444" }}>{reportData.summary?.outOfStockCount}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="table-responsive" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "#fff" }}>
                  <h4 style={{ margin: "14px 16px 8px 16px", fontWeight: "700", fontSize: "0.9rem" }}>Low Stock Alert Items</h4>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Min Stock</th>
                        <th>Current Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData.tables?.lowStock || []).map((l) => (
                        <tr key={l._id}>
                          <td><Link to={`/inventory/${l._id}`} style={{ fontWeight: "600", color: "var(--primary-color)" }}>{l.productId?.productName}</Link></td>
                          <td>{l.minimumStock} {l.productId?.unit}</td>
                          <td style={{ color: "#eab308", fontWeight: "700" }}>{l.currentStock} {l.productId?.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="table-responsive" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "#fff" }}>
                  <h4 style={{ margin: "14px 16px 8px 16px", fontWeight: "700", fontSize: "0.9rem" }}>Out of Stock Alert Items</h4>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Min Stock</th>
                        <th>Current Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData.tables?.outOfStock || []).map((o) => (
                        <tr key={o._id}>
                          <td><Link to={`/inventory/${o._id}`} style={{ fontWeight: "600", color: "var(--primary-color)" }}>{o.productId?.productName}</Link></td>
                          <td>{o.minimumStock} {o.productId?.unit}</td>
                          <td style={{ color: "#ef4444", fontWeight: "700" }}>{o.currentStock} {o.productId?.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="table-responsive" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "#fff" }}>
                  <h4 style={{ margin: "14px 16px 8px 16px", fontWeight: "700", fontSize: "0.9rem" }}>Fast Moving Products Share</h4>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity Sold</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData.tables?.fastMoving || []).map((f, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: "600" }}>{f._id}</td>
                          <td>{f.salesQuantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="table-responsive" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "#fff" }}>
                  <h4 style={{ margin: "14px 16px 8px 16px", fontWeight: "700", fontSize: "0.9rem" }}>Slow Moving Products Share</h4>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity Sold</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData.tables?.slowMoving || []).map((s, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: "600" }}>{s._id}</td>
                          <td>{s.salesQuantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Customer stats view */}
          {selectedReport === "customer" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "16px", borderRadius: "8px", maxWidth: "240px" }}>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Total Dues Outstanding</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#ef4444" }}>{formatCurrency(reportData.cards?.totalOutstanding)}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                <ChartContainer title="Top Spending Customers" type="bar" data={reportData.charts?.topCustomers} />
              </div>

              <div className="table-responsive" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "#fff" }}>
                <h4 style={{ margin: "14px 16px 8px 16px", fontWeight: "700", fontSize: "0.9rem" }}>Outstanding Balances Accounts</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Total Balance Due</th>
                      <th>Invoices Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.tables?.outstanding || []).map((o, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: "600" }}>{o._id}</td>
                        <td style={{ color: "#ef4444", fontWeight: "700" }}>{formatCurrency(o.due)}</td>
                        <td>{o.invoicesCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Supplier Performance view */}
          {selectedReport === "supplier" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <ChartContainer title="Supplier Replenishment Purchases Value" type="area" data={reportData.charts?.topSuppliers} />
                <ChartContainer title="Supplier Category Distribution" type="donut" data={reportData.charts?.categories} />
              </div>

              <div className="table-responsive" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "#fff" }}>
                <h4 style={{ margin: "14px 16px 8px 16px", fontWeight: "700", fontSize: "0.9rem" }}>Active Supplier Partners Ratings</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Business Name</th>
                      <th>Category</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.tables?.suppliersList || []).map((s) => (
                      <tr key={s._id}>
                        <td><Link to={`/suppliers/${s._id}`} style={{ fontWeight: "600", color: "var(--primary-color)" }}>{s.businessName}</Link></td>
                        <td>{s.supplierCategory}</td>
                        <td>⭐ {s.supplierRating || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payments Collections view */}
          {selectedReport === "payment" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "16px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Cleared Collections</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#10b981" }}>{formatCurrency(reportData.summary?.collectionSummary)}</div>
                </div>
                <div style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "16px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Pending Collection Dues</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#eab308" }}>{formatCurrency(reportData.summary?.pendingPayments)}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <ChartContainer title="Cleared Collections Velocity" type="line" data={reportData.charts?.dailyCollections} />
                <ChartContainer title="Payment Mode Breakdown" type="donut" data={reportData.charts?.methodBreakdown} />
              </div>

              <div className="table-responsive" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "#fff" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Ref Number</th>
                      <th>Collection Date</th>
                      <th>Method</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.tables?.paymentsList || []).map((p) => (
                      <tr key={p._id}>
                        <td><Link to={`/payments/${p._id}`} style={{ fontWeight: "600", color: "var(--primary-color)" }}>{p.transactionId || p._id}</Link></td>
                        <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                        <td>{p.paymentMethod}</td>
                        <td>{formatCurrency(p.amount)}</td>
                        <td><span className={`badge badge-${p.status === "Cleared" ? "success" : "warning"}`}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Outstanding Receivables view */}
          {selectedReport === "outstanding" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "16px", borderRadius: "8px", maxWidth: "240px" }}>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Total Outstanding Dues</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#ef4444" }}>{formatCurrency(reportData.summary?.totalDue)}</div>
              </div>

              <div className="table-responsive" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "#fff" }}>
                <h4 style={{ margin: "14px 16px 8px 16px", fontWeight: "700", fontSize: "0.9rem" }}>Aging Invoices Outstanding Dues</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Invoice Number</th>
                      <th>Customer</th>
                      <th>Due Date</th>
                      <th>Due Amount</th>
                      <th>Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.tables?.outstandingInvoices || []).map((o) => (
                      <tr key={o._id}>
                        <td><Link to={`/billing/${o._id}`} style={{ fontWeight: "600", color: "var(--primary-color)" }}>{o.invoiceNumber}</Link></td>
                        <td>{o.customerSnapshot?.businessName}</td>
                        <td>{new Date(o.dueDate).toLocaleDateString()}</td>
                        <td style={{ color: "#ef4444", fontWeight: "700" }}>{formatCurrency(o.dueAmount)}</td>
                        <td>{formatCurrency(o.grandTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Products Performance view */}
          {selectedReport === "product" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                <ChartContainer title="Category Performance Sales Share" type="bar" data={reportData.charts?.categories} />
              </div>

              <div className="table-responsive" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "#fff" }}>
                <h4 style={{ margin: "14px 16px 8px 16px", fontWeight: "700", fontSize: "0.9rem" }}>Product Sales Performance Summary</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Product Code</th>
                      <th>Total Quantity Sold</th>
                      <th>Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.tables?.performance || []).map((p) => (
                      <tr key={p._id}>
                        <td><Link to={`/products/${p._id}`} style={{ fontWeight: "600", color: "var(--primary-color)" }}>{p.productName}</Link></td>
                        <td>{p.productCode}</td>
                        <td>{p.quantitySold}</td>
                        <td>{formatCurrency(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Export Actions buttons */}
          <ExportButtons reportName={selectedReport} />

          {/* Audit Metadata Logging */}
          <div style={{ marginTop: "30px", borderTop: "1px dashed var(--border-color)", paddingTop: "14px", fontSize: "0.75rem", color: "#9ca3af", display: "flex", justifyContent: "space-between" }}>
            <span><strong>Generated At:</strong> {reportData.metadata?.generatedAt ? new Date(reportData.metadata.generatedAt).toLocaleString() : "N/A"}</span>
            <span><strong>Execution time:</strong> {reportData.metadata?.executionTime || 0}ms</span>
          </div>
        </div>
      )}
    </section>
  );
}
