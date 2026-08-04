import React, { useEffect, useState } from "react";
import { useSettingsStore } from "../store/settingsStore";

/**
 * Centered ERP settings panel view.
 * Displays tabs for Company profile, feature flags, billing, and system debug.
 * @component
 */
export default function Settings() {
  const { settings, loading, error, fetchSettings, saveSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState("company");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    companyName: "", logo: "", gstNumber: "", address: "", phone: "", email: "", businessType: "Vegetable Supplier",
    currency: "INR", timezone: "Asia/Kolkata", financialYear: "2026-2027",
    vegetablesEnabled: true, fruitsEnabled: true, dairyEnabled: true, groceryEnabled: true, beveragesEnabled: true, packagingEnabled: true,
    defaultPaymentCycle: "COD", allowNegativeStock: false, allowPartialPayments: true, autoReserveInventory: true,
    invoicePrefix: "INV", paymentPrefix: "PAY", purchasePrefix: "PUR", supplierPrefix: "SPL",
    whatsappEnabled: false, emailEnabled: false, smsEnabled: false,
    maintenanceMode: false, debugMode: false,
    features: {
      purchaseModuleEnabled: true, inventoryModuleEnabled: true,
      invoiceModuleEnabled: true, paymentModuleEnabled: true,
      reportsModuleEnabled: true, dashboardModuleEnabled: true,
      automationModuleEnabled: false, aiModuleEnabled: false,
      customerPortalEnabled: false
    }
  });

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setForm({
        companyName: settings.companyName || "",
        logo: settings.logo || "",
        gstNumber: settings.gstNumber || "",
        address: settings.address || "",
        phone: settings.phone || "",
        email: settings.email || "",
        businessType: settings.businessType || "Vegetable Supplier",
        currency: settings.currency || "INR",
        timezone: settings.timezone || "Asia/Kolkata",
        financialYear: settings.financialYear || "2026-2027",
        vegetablesEnabled: settings.vegetablesEnabled !== false,
        fruitsEnabled: settings.fruitsEnabled !== false,
        dairyEnabled: settings.dairyEnabled !== false,
        groceryEnabled: settings.groceryEnabled !== false,
        beveragesEnabled: settings.beveragesEnabled !== false,
        packagingEnabled: settings.packagingEnabled !== false,
        defaultPaymentCycle: settings.defaultPaymentCycle || "COD",
        allowNegativeStock: !!settings.allowNegativeStock,
        allowPartialPayments: settings.allowPartialPayments !== false,
        autoReserveInventory: settings.autoReserveInventory !== false,
        invoicePrefix: settings.invoicePrefix || "INV",
        paymentPrefix: settings.paymentPrefix || "PAY",
        purchasePrefix: settings.purchasePrefix || "PUR",
        supplierPrefix: settings.supplierPrefix || "SPL",
        whatsappEnabled: !!settings.whatsappEnabled,
        emailEnabled: !!settings.emailEnabled,
        smsEnabled: !!settings.smsEnabled,
        maintenanceMode: !!settings.maintenanceMode,
        debugMode: !!settings.debugMode,
        features: {
          purchaseModuleEnabled: settings.features?.purchaseModuleEnabled !== false,
          inventoryModuleEnabled: settings.features?.inventoryModuleEnabled !== false,
          invoiceModuleEnabled: settings.features?.invoiceModuleEnabled !== false,
          paymentModuleEnabled: settings.features?.paymentModuleEnabled !== false,
          reportsModuleEnabled: settings.features?.reportsModuleEnabled !== false,
          dashboardModuleEnabled: settings.features?.dashboardModuleEnabled !== false,
          automationModuleEnabled: !!settings.features?.automationModuleEnabled,
          aiModuleEnabled: !!settings.features?.aiModuleEnabled,
          customerPortalEnabled: !!settings.features?.customerPortalEnabled,
        }
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFeatureChange = (e) => {
    const { name, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [name]: checked,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await saveSettings(form);
      setSuccessMsg("System configuration settings saved successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update configuration settings.");
    }
  };

  const tabs = [
    { id: "company", name: "Company Ledger" },
    { id: "features", name: "ERP Modules" },
    { id: "catalog", name: "Catalog Categories" },
    { id: "business", name: "Business Rules" },
    { id: "prefix", name: "Serial Prefixes" },
    { id: "alerts", name: "Alerts & Debug" }
  ];

  if (loading && !settings) return <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading configurations...</div>;
  if (error) return <div style={{ padding: "30px", background: "#fef2f2", color: "#991b1b" }}>Error loading settings: {error}</div>;

  return (
    <section id="view-settings" className="view-section" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div className="view-header">
        <div className="view-title">
          <h1>ERP Configurations Settings</h1>
          <p>Configure company metadata, customize invoice prefix numbering, and control system feature modules</p>
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", marginBottom: "20px", gap: "10px" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`filter-tab ${activeTab === t.id ? "active" : ""}`}
            style={{
              padding: "10px 16px", background: "none", border: "none", borderBottom: activeTab === t.id ? "2px solid var(--primary-color)" : "none",
              color: activeTab === t.id ? "var(--primary-color)" : "#4b5563", fontWeight: "600", cursor: "pointer", fontSize: "0.9rem"
            }}
            onClick={() => setActiveTab(t.id)}
          >
            {t.name}
          </button>
        ))}
      </div>

      {successMsg && <div style={{ marginBottom: "16px", padding: "10px 14px", background: "#dcfce7", color: "#15803d", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "600" }}>{successMsg}</div>}
      {errorMsg && <div style={{ marginBottom: "16px", padding: "10px 14px", background: "#fef2f2", color: "#b91c1c", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "600" }}>{errorMsg}</div>}

      <form onSubmit={handleSubmit} style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        {activeTab === "company" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ margin: "0 0 10px 0", fontWeight: "700" }}>Company Profile Information</h3>
            <div>
              <label htmlFor="company-name" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Company Legal Name</label>
              <input id="company-name" type="text" className="form-input" name="companyName" value={form.companyName} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label htmlFor="company-biz" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Business Type Classification</label>
                <select id="company-biz" className="form-select" name="businessType" value={form.businessType} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                  <option value="Vegetable Supplier">Vegetable Supplier</option>
                  <option value="Grocery Distributor">Grocery Distributor</option>
                  <option value="Dairy Supplier">Dairy Supplier</option>
                  <option value="Pharma Distributor">Pharma Distributor</option>
                  <option value="Automobile Parts">Automobile Parts</option>
                </select>
              </div>
              <div>
                <label htmlFor="company-gst" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>GSTIN Tax Registration</label>
                <input id="company-gst" type="text" className="form-input" name="gstNumber" value={form.gstNumber} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label htmlFor="company-phone" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Office Contact Number</label>
                <input id="company-phone" type="tel" className="form-input" name="phone" value={form.phone} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
              </div>
              <div>
                <label htmlFor="company-email" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Office Email Address</label>
                <input id="company-email" type="email" className="form-input" name="email" value={form.email} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
              </div>
            </div>
            <div>
              <label htmlFor="company-address" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Registered Office Address</label>
              <textarea id="company-address" className="form-input" name="address" value={form.address} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)", minHeight: "60px" }} />
            </div>
          </div>
        )}

        {activeTab === "features" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ margin: "0 0 10px 0", fontWeight: "700" }}>Active ERP Modules (Feature Flags)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { id: "dashboardModuleEnabled", label: "Dashboard Module" },
                { id: "inventoryModuleEnabled", label: "Inventory Stock Module" },
                { id: "purchaseModuleEnabled", label: "Purchase Replenishments" },
                { id: "invoiceModuleEnabled", label: "Billing & Invoices Module" },
                { id: "paymentModuleEnabled", label: "Payments Ledger" },
                { id: "reportsModuleEnabled", label: "Analytics & Reports" },
                { id: "automationModuleEnabled", label: "Workflow Automation" },
                { id: "aiModuleEnabled", label: "AI Prediction Assistant" },
                { id: "customerPortalEnabled", label: "Customer Ordering Portal" }
              ].map((flag) => (
                <label key={flag.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem", fontWeight: "500" }}>
                  <input type="checkbox" name={flag.id} checked={form.features[flag.id]} onChange={handleFeatureChange} style={{ transform: "scale(1.2)" }} />
                  {flag.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === "catalog" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ margin: "0 0 10px 0", fontWeight: "700" }}>Supported Catalog Category Switch</h3>
            <p style={{ color: "#6b7280", fontSize: "0.825rem", margin: 0 }}>Disabled categories will automatically be hidden across all list filters, purchase items, and catalog registration dropdown selectors.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
              {[
                { id: "vegetablesEnabled", label: "Vegetables Category" },
                { id: "fruitsEnabled", label: "Fruits Category" },
                { id: "dairyEnabled", label: "Dairy Products" },
                { id: "groceryEnabled", label: "Grocery Catalog" },
                { id: "beveragesEnabled", label: "Beverages Section" },
                { id: "packagingEnabled", label: "Packaging Materials" }
              ].map((sw) => (
                <label key={sw.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem", fontWeight: "500" }}>
                  <input type="checkbox" name={sw.id} checked={form[sw.id]} onChange={handleChange} style={{ transform: "scale(1.2)" }} />
                  {sw.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === "business" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ margin: "0 0 10px 0", fontWeight: "700" }}>Regional & General Settings</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label htmlFor="biz-currency" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Currency Symbol</label>
                <input id="biz-currency" type="text" className="form-input" name="currency" value={form.currency} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
              </div>
              <div>
                <label htmlFor="biz-tz" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Timezone</label>
                <input id="biz-tz" type="text" className="form-input" name="timezone" value={form.timezone} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label htmlFor="biz-fy" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Financial Year</label>
                <input id="biz-fy" type="text" className="form-input" name="financialYear" value={form.financialYear} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
              </div>
              <div>
                <label htmlFor="biz-terms" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Default Payment Terms</label>
                <input id="biz-terms" type="text" className="form-input" name="defaultPaymentCycle" value={form.defaultPaymentCycle} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
              </div>
            </div>
            <h3 style={{ margin: "10px 0 0 0", fontWeight: "700" }}>Operations Rules</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                <input type="checkbox" name="allowNegativeStock" checked={form.allowNegativeStock} onChange={handleChange} />
                Allow Negative stock dispatch levels (Disable order reserve verification validation warnings)
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                <input type="checkbox" name="allowPartialPayments" checked={form.allowPartialPayments} onChange={handleChange} />
                Allow Partial invoice payments settle collections
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                <input type="checkbox" name="autoReserveInventory" checked={form.autoReserveInventory} onChange={handleChange} />
                Automatically allocate and reserve catalog quantities during order confirmation
              </label>
            </div>
          </div>
        )}

        {activeTab === "prefix" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ margin: "0 0 10px 0", fontWeight: "700" }}>Serial Code Overrides</h3>
            <p style={{ color: "#6b7280", fontSize: "0.825rem", margin: 0 }}>Configure prefix headers used to generate alphanumeric series (e.g. INV, SPL, PUR).</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
              <div>
                <label htmlFor="pref-inv" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Invoice Prefix</label>
                <input id="pref-inv" type="text" className="form-input" name="invoicePrefix" value={form.invoicePrefix} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
              </div>
              <div>
                <label htmlFor="pref-pay" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Payment Prefix</label>
                <input id="pref-pay" type="text" className="form-input" name="paymentPrefix" value={form.paymentPrefix} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label htmlFor="pref-pur" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Purchase Prefix</label>
                <input id="pref-pur" type="text" className="form-input" name="purchasePrefix" value={form.purchasePrefix} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
              </div>
              <div>
                <label htmlFor="pref-spl" style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Supplier Prefix</label>
                <input id="pref-spl" type="text" className="form-input" name="supplierPrefix" value={form.supplierPrefix} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "alerts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ margin: "0 0 10px 0", fontWeight: "700" }}>System Notification Alert Modes</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                <input type="checkbox" name="whatsappEnabled" checked={form.whatsappEnabled} onChange={handleChange} />
                Send real-time alerts via WhatsApp API integrations
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                <input type="checkbox" name="emailEnabled" checked={form.emailEnabled} onChange={handleChange} />
                Distribute reports and statements via email SMTP relays
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                <input type="checkbox" name="smsEnabled" checked={form.smsEnabled} onChange={handleChange} />
                Broadcast messages via telecommunication SMS gateways
              </label>
            </div>
            
            <h3 style={{ margin: "12px 0 0 0", fontWeight: "700" }}>System Maintenance & Debugging</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                <input type="checkbox" name="maintenanceMode" checked={form.maintenanceMode} onChange={handleChange} />
                Enable System Maintenance (Restricts non-admin users API connections access)
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                <input type="checkbox" name="debugMode" checked={form.debugMode} onChange={handleChange} />
                Enable Debug logger operations (Print details inside audit system consoles)
              </label>
            </div>

            <div style={{ padding: "12px", border: "1px dashed var(--border-color)", borderRadius: "8px", marginTop: "14px", fontSize: "0.8rem", color: "#6b7280" }}>
              <strong>ERP Version:</strong> {settings?.systemVersion || "1.0.0"} &nbsp;|&nbsp; <strong>Last Updated:</strong> {settings?.lastUpdated ? new Date(settings.lastUpdated).toLocaleString("en-IN") : "N/A"}
            </div>
          </div>
        )}

        <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
          <button type="submit" className="btn btn-primary" style={{ padding: "10px 24px" }}>
            Save Configuration Changes
          </button>
        </div>
      </form>
    </section>
  );
}
