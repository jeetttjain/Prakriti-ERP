import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useSettingsStore } from "../store/settingsStore";
import { ROUTES } from "../constants/routes";

/**
 * Layout panel shell wrapping dashboard screens with a left sidebar and top bar.
 * @component
 * @param {Object} props Props
 * @param {React.ReactNode} props.children Child routes/elements
 */
export default function AdminLayout({ children }) {
  const { isAdminLoggedIn, currentUser, logoutAdmin } = useAuthStore();
  const isModuleEnabled = useSettingsStore((state) => state.isModuleEnabled);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarActive, setIsSidebarActive] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate(ROUTES.LOGIN);
    }
  }, [isAdminLoggedIn, navigate]);

  const handleLogout = () => {
    logoutAdmin();
    navigate(ROUTES.LOGIN);
  };

  const getMenuClass = (path) => {
    const active = location.pathname.startsWith(path);
    return `menu-item ${active ? "active" : ""}`;
  };

  const getTodayDateString = () => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return new Date().toLocaleDateString("en-US", options);
  };

  if (!isAdminLoggedIn) {
    return null;
  }

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <aside className={`sidebar ${isSidebarActive ? "active" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#16a34a", color: "white", fontWeight: "bold", fontSize: "1.2rem", width: "40px", height: "40px", borderRadius: "8px" }}>
            P
          </div>
          <div className="logo-text">
            Prakriti
            <span>Veg wholesale</span>
          </div>
        </div>
        <nav className="sidebar-menu">
          {isModuleEnabled("dashboardModuleEnabled") && useAuthStore.getState().hasModuleAccess("Dashboard") && (
            <Link to={ROUTES.DASHBOARD} className={getMenuClass(ROUTES.DASHBOARD)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"></rect><rect x="14" y="3" width="7" height="5" rx="1"></rect><rect x="14" y="12" width="7" height="9" rx="1"></rect><rect x="3" y="16" width="7" height="5" rx="1"></rect></svg>
              Dashboard
            </Link>
          )}
          {useAuthStore.getState().hasModuleAccess("Order") && (
            <Link to={ROUTES.ORDERS} className={getMenuClass(ROUTES.ORDERS)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              Orders
            </Link>
          )}
          {useAuthStore.getState().hasModuleAccess("Customer") && (
            <Link to={ROUTES.CUSTOMERS} className={getMenuClass(ROUTES.CUSTOMERS)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Customers
            </Link>
          )}
          {isModuleEnabled("purchaseModuleEnabled") && useAuthStore.getState().hasModuleAccess("Supplier") && (
            <Link to={ROUTES.SUPPLIERS} className={getMenuClass(ROUTES.SUPPLIERS)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Suppliers
            </Link>
          )}
          {useAuthStore.getState().hasModuleAccess("Product") && (
            <Link to={ROUTES.PRODUCTS} className={getMenuClass(ROUTES.PRODUCTS)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
              Products
            </Link>
          )}
          {isModuleEnabled("inventoryModuleEnabled") && useAuthStore.getState().hasModuleAccess("Inventory") && (
            <Link to={ROUTES.INVENTORY} className={getMenuClass(ROUTES.INVENTORY)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
              Inventory
            </Link>
          )}
          {isModuleEnabled("purchaseModuleEnabled") && useAuthStore.getState().hasModuleAccess("Purchase") && (
            <Link to={ROUTES.PURCHASES} className={getMenuClass(ROUTES.PURCHASES)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              Purchases
            </Link>
          )}
          {isModuleEnabled("invoiceModuleEnabled") && useAuthStore.getState().hasModuleAccess("Invoice") && (
            <Link to={ROUTES.BILLING} className={getMenuClass(ROUTES.BILLING)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Billing
            </Link>
          )}
          {isModuleEnabled("paymentModuleEnabled") && useAuthStore.getState().hasModuleAccess("Payment") && (
            <Link to={ROUTES.PAYMENTS} className={getMenuClass(ROUTES.PAYMENTS)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
              Payments
            </Link>
          )}
          {isModuleEnabled("reportsModuleEnabled") && useAuthStore.getState().hasModuleAccess("Reports") && (
            <Link to={ROUTES.REPORTS} className={getMenuClass(ROUTES.REPORTS)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              Reports
            </Link>
          )}
          {useAuthStore.getState().hasModuleAccess("Reports") && (
            <Link to={ROUTES.BUSINESS_INTELLIGENCE} className={getMenuClass(ROUTES.BUSINESS_INTELLIGENCE)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              BI Console
            </Link>
          )}
          {useAuthStore.getState().hasModuleAccess("Settings") && (
            <Link to={ROUTES.COMMUNICATION} className={getMenuClass(ROUTES.COMMUNICATION)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Communication
            </Link>
          )}
          {useAuthStore.getState().hasModuleAccess("Settings") && (
            <Link to={ROUTES.DATA_PLATFORM} className={getMenuClass(ROUTES.DATA_PLATFORM)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              Data Platform
            </Link>
          )}
          {useAuthStore.getState().hasModuleAccess("Settings") && (
            <Link to={ROUTES.IDENTITY} className={getMenuClass(ROUTES.IDENTITY)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              Identity Platform
            </Link>
          )}
          {useAuthStore.getState().hasModuleAccess("Settings") && (
            <Link to={ROUTES.OBSERVABILITY} className={getMenuClass(ROUTES.OBSERVABILITY)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              Operations Center
            </Link>
          )}
          {useAuthStore.getState().hasModuleAccess("Settings") && (
            <Link to={ROUTES.FINANCE} className={getMenuClass(ROUTES.FINANCE)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              Finance & Accounting
            </Link>
          )}
          {useAuthStore.getState().hasModuleAccess("Settings") && (
            <Link to={ROUTES.SUPPLY_CHAIN} className={getMenuClass(ROUTES.SUPPLY_CHAIN)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 3h15v13H1z"></path><path d="M16 8h4l3 3v5h-7V8z"></path><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              Supply Chain
            </Link>
          )}
          {useAuthStore.getState().hasModuleAccess("Settings") && (
            <Link to={ROUTES.SYSTEM_CONTROL} className={getMenuClass(ROUTES.SYSTEM_CONTROL)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              System Control
            </Link>
          )}
          {useAuthStore.getState().hasModuleAccess("Settings") && (
            <Link to={ROUTES.HRMS} className={getMenuClass(ROUTES.HRMS)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              HRMS Platform
            </Link>
          )}
          {useAuthStore.getState().hasModuleAccess("Settings") && (
            <Link to={ROUTES.NOTIFICATIONS} className={getMenuClass(ROUTES.NOTIFICATIONS)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              Notifications
            </Link>
          )}
          {useAuthStore.getState().hasModuleAccess("User") && (
            <Link to={ROUTES.USERS} className={getMenuClass(ROUTES.USERS)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
              Users
            </Link>
          )}
          {useAuthStore.getState().hasModuleAccess("Role") && (
            <Link to={ROUTES.ROLES} className={getMenuClass(ROUTES.ROLES)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
              Roles
            </Link>
          )}
          <Link to={ROUTES.PROFILE} className={getMenuClass(ROUTES.PROFILE)} onClick={() => setIsSidebarActive(false)}>
            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            My Profile
          </Link>
          {useAuthStore.getState().hasModuleAccess("Settings") && (
            <Link to={ROUTES.SETTINGS} className={getMenuClass(ROUTES.SETTINGS)} onClick={() => setIsSidebarActive(false)}>
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              Settings
            </Link>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="admin-mini-profile">
            <div className="avatar">A</div>
            <div className="profile-info">
              <span className="profile-name">{currentUser?.name || "Admin Owner"}</span>
              <span className="profile-role">Wholesale Buyer</span>
            </div>
          </div>
          <button className="btn-logout" title="Logout" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="main-wrapper">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-left">
            <button className="hamburger" onClick={() => setIsSidebarActive(!isSidebarActive)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className="search-container">
              <svg className="search-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" className="search-input" placeholder="Search orders, customers, products...">
              </input>
            </div>
          </div>
          <div className="top-right">
            <div className="date-indicator">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>{getTodayDateString()}</span>
            </div>
            <button className="notification-bell">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
}
