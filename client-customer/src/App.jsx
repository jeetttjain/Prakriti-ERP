import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./constants/routes";

const QRLanding = lazy(() => import("./pages/QRLanding"));
const CustomerLogin = lazy(() => import("./pages/CustomerLogin"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const Invoices = lazy(() => import("./pages/Invoices"));
const Payments = lazy(() => import("./pages/Payments"));
const Offers = lazy(() => import("./pages/Offers"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Support = lazy(() => import("./pages/Support"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: "24px", textAlign: "center" }}>Loading Customer Portal...</div>}>
        <Routes>
          <Route path={ROUTES.QR_LANDING} element={<QRLanding />} />
          <Route path={ROUTES.LOGIN} element={<CustomerLogin />} />
          <Route path={ROUTES.DASHBOARD} element={<CustomerDashboard />} />
          <Route path={ROUTES.PRODUCTS} element={<Products />} />
          <Route path={ROUTES.PRODUCT_DETAILS} element={<ProductDetails />} />
          <Route path={ROUTES.CART} element={<Cart />} />
          <Route path={ROUTES.CHECKOUT} element={<Checkout />} />
          <Route path={ROUTES.ORDERS} element={<Orders />} />
          <Route path={ROUTES.ORDER_DETAILS} element={<OrderDetails />} />
          <Route path={ROUTES.INVOICES} element={<Invoices />} />
          <Route path={ROUTES.PAYMENTS} element={<Payments />} />
          <Route path={ROUTES.OFFERS} element={<Offers />} />
          <Route path={ROUTES.FAVORITES} element={<Favorites />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<Notifications />} />
          <Route path={ROUTES.SUPPORT} element={<Support />} />
          <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={ROUTES.SETTINGS} element={<Settings />} />
          <Route path="*" element={<Navigate to={ROUTES.QR_LANDING} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
