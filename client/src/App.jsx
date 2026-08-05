import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./constants/routes";
import { useSettingsStore } from "./store/settingsStore";

// Layout & Gate Components
import AdminLayout from "./layouts/AdminLayout";
import CustomerLayout from "./layouts/CustomerLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Lazy-loaded Views & Pages
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/dashboard/ExecutiveDashboard"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const Customers = lazy(() => import("./pages/Customers"));
const CustomerDetails = lazy(() => import("./pages/CustomerDetails"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Inventory = lazy(() => import("./pages/Inventory"));
const InventoryDetails = lazy(() => import("./pages/InventoryDetails"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const SupplierDetails = lazy(() => import("./pages/SupplierDetails"));
const Purchases = lazy(() => import("./pages/Purchases"));
const PurchaseDetails = lazy(() => import("./pages/PurchaseDetails"));
const Invoices = lazy(() => import("./pages/Invoices"));
const InvoiceDetails = lazy(() => import("./pages/InvoiceDetails"));
const Payments = lazy(() => import("./pages/Payments"));
const PaymentDetails = lazy(() => import("./pages/PaymentDetails"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const CustomerOrdering = lazy(() => import("./pages/CustomerOrdering"));
const Users = lazy(() => import("./pages/Users"));
const Roles = lazy(() => import("./pages/Roles"));
const Profile = lazy(() => import("./pages/Profile"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const Notifications = lazy(() => import("./pages/Notifications"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));
const Automation = lazy(() => import("./pages/Automation"));
const BusinessIntelligence = lazy(() => import("./pages/business-intelligence/BusinessIntelligenceConsole"));
const Communication = lazy(() => import("./pages/communication/CommunicationConsole"));
const DataPlatform = lazy(() => import("./pages/data-platform/EnterpriseDataConsole"));
const Identity = lazy(() => import("./pages/identity/IdentityConsole"));
const Observability = lazy(() => import("./pages/observability/EnterpriseOperationsCenter"));
const Finance = lazy(() => import("./pages/finance/EnterpriseFinanceConsole"));

// Customer Portal Pages
const CustomerLogin = lazy(() => import("./pages/portal/CustomerLogin"));
const CustomerDashboard = lazy(() => import("./pages/portal/CustomerDashboard"));
const MyOrders = lazy(() => import("./pages/portal/MyOrders"));
const MyOrderDetails = lazy(() => import("./pages/portal/MyOrderDetails"));
const MyInvoices = lazy(() => import("./pages/portal/MyInvoices"));
const MyInvoiceDetails = lazy(() => import("./pages/portal/MyInvoiceDetails"));
const MyPayments = lazy(() => import("./pages/portal/MyPayments"));
const MyProfile = lazy(() => import("./pages/portal/MyProfile"));
const MyNotifications = lazy(() => import("./pages/portal/MyNotifications"));

// Customer Portal Phase-2 Pages
const PortalProducts = lazy(() => import("./pages/portal/Products"));
const PortalProductDetails = lazy(() => import("./pages/portal/ProductDetails"));
const PortalCart = lazy(() => import("./pages/portal/Cart"));
const PortalCheckout = lazy(() => import("./pages/portal/Checkout"));
const PortalDraftOrders = lazy(() => import("./pages/portal/DraftOrders"));
const PortalFavorites = lazy(() => import("./pages/portal/Favorites"));
const PortalOffers = lazy(() => import("./pages/portal/Offers"));
const PortalSupport = lazy(() => import("./pages/portal/Support"));

function PageLoader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f8fafc", color: "#64748b" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "40px", height: "40px", border: "4px solid #e2e8f0", borderTopColor: "#16a34a", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }}></div>
        <p style={{ fontWeight: 500, fontSize: "14px" }}>Loading ERP Module...</p>
      </div>
    </div>
  );
}

/**
 * Root Application Router configuring ERP routes
 * @component
 */
export default function App() {
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Guest login */}
          <Route
            path={ROUTES.LOGIN}
            element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            }
          />

          {/* Customer ordering Portal - Mobile wrapped in CustomerLayout */}
          <Route
            path={ROUTES.CUSTOMER_ORDERING}
            element={
              <CustomerLayout>
                <CustomerOrdering />
              </CustomerLayout>
            }
          />

          {/* Customer Self-Service Portal Routes */}
          <Route path={ROUTES.CUSTOMER_LOGIN} element={<CustomerLogin />} />
          <Route
            path={ROUTES.CUSTOMER_DASHBOARD}
            element={
              <CustomerLayout pageTitle="Dashboard">
                <CustomerDashboard />
              </CustomerLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_ORDERS}
            element={
              <CustomerLayout pageTitle="My Orders">
                <MyOrders />
              </CustomerLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_ORDER_DETAILS}
            element={
              <CustomerLayout pageTitle="Order Details">
                <MyOrderDetails />
              </CustomerLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_INVOICES}
            element={
              <CustomerLayout pageTitle="My Invoices">
                <MyInvoices />
              </CustomerLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_INVOICE_DETAILS}
            element={
              <CustomerLayout pageTitle="Invoice Details">
                <MyInvoiceDetails />
              </CustomerLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_PAYMENTS}
            element={
              <CustomerLayout pageTitle="Payments">
                <MyPayments />
              </CustomerLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_PROFILE}
            element={
              <CustomerLayout pageTitle="My Profile">
                <MyProfile />
              </CustomerLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_NOTIFICATIONS}
            element={
              <CustomerLayout pageTitle="Notifications">
                <MyNotifications />
              </CustomerLayout>
            }
          />

          {/* Phase-2: Shopping & Transactional Portal */}
          <Route
            path={ROUTES.CUSTOMER_PRODUCTS}
            element={
              <CustomerLayout pageTitle="Shop">
                <PortalProducts />
              </CustomerLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_PRODUCT_DETAILS}
            element={
              <CustomerLayout pageTitle="Product">
                <PortalProductDetails />
              </CustomerLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_CART}
            element={
              <CustomerLayout pageTitle="My Cart">
                <PortalCart />
              </CustomerLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_CHECKOUT}
            element={
              <CustomerLayout pageTitle="Checkout">
                <PortalCheckout />
              </CustomerLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_DRAFTS}
            element={
              <CustomerLayout pageTitle="Draft Orders">
                <PortalDraftOrders />
              </CustomerLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_FAVORITES}
            element={
              <CustomerLayout pageTitle="Favourites">
                <PortalFavorites />
              </CustomerLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_OFFERS}
            element={
              <CustomerLayout pageTitle="Offers">
                <PortalOffers />
              </CustomerLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_SUPPORT}
            element={
              <CustomerLayout pageTitle="Help & Support">
                <PortalSupport />
              </CustomerLayout>
            }
          />

          {/* Protected Admin Console Routes */}
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ORDERS}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <Orders />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ORDER_DETAILS}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <OrderDetails />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.CUSTOMERS}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <Customers />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_DETAILS}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <CustomerDetails />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PRODUCTS}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <Products />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PRODUCT_DETAILS}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <ProductDetails />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.INVENTORY}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <Inventory />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.INVENTORY_DETAILS}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <InventoryDetails />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.SUPPLIERS}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <Suppliers />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.SUPPLIER_DETAILS}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <SupplierDetails />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PURCHASES}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <Purchases />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PURCHASE_DETAILS}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <PurchaseDetails />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.BILLING}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <Invoices />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.INVOICE_DETAILS}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <InvoiceDetails />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PAYMENTS}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <Payments />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PAYMENT_DETAILS}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <PaymentDetails />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.REPORTS}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <Reports />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.SETTINGS}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <Settings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.USERS}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <Users />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ROLES}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <Roles />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PROFILE}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <Profile />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.CHANGE_PASSWORD}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <ChangePassword />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.NOTIFICATIONS}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <Notifications />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.AUDIT_LOGS}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <AuditLogs />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.AUTOMATION}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <Automation />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.BUSINESS_INTELLIGENCE}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <BusinessIntelligence />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.COMMUNICATION}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <Communication />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.DATA_PLATFORM}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <DataPlatform />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.IDENTITY}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <Identity />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.OBSERVABILITY}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <Observability />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.FINANCE}
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminLayout>
                  <Finance />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Root Fallbacks */}
          <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}