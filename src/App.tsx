import OrderTrackingPage from "@/pages/OrderTrackingPage";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { LocationProvider, useLocation } from "@/contexts/LocationContext";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import CategoryPage from "@/pages/CategoryPage";
import ProductPage from "@/pages/ProductPage";
import SearchPage from "@/pages/SearchPage";
import CheckoutPage from "@/pages/CheckoutPage";
import ConfirmationPage from "@/pages/ConfirmationPage";
import OrdersPage from "@/pages/OrdersPage";
import AccountPage from "@/pages/AccountPage";
import LocationGatePage from "@/pages/LocationGatePage";
import AllProductsPage from "@/pages/AllProductsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Route guard for location
const RequireLocation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLocationSet } = useLocation();
  
  if (!isLocationSet) {
    return <Navigate to="/location" replace />;
  }
  
  return <>{children}</>;
};

// Redirect if location is already set
const LocationRoute: React.FC = () => {
  const { isLocationSet } = useLocation();
  
  if (isLocationSet) {
    return <Navigate to="/" replace />;
  }
  
  return <LocationGatePage />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/location" element={<LocationRoute />} />
    <Route element={
      <RequireLocation>
        <Layout />
      </RequireLocation>
    }>
      <Route path="/" element={<HomePage />} />
      <Route path="/category/:categoryId" element={<CategoryPage />} />
      <Route path="/product/:productId" element={<ProductPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/all-products" element={<AllProductsPage />} />
    </Route>
    <Route path="/checkout" element={
  <RequireLocation>
    <CheckoutPage />
  </RequireLocation>
} />

<Route path="/confirmation/:orderId" element={
  <RequireLocation>
    <ConfirmationPage />
  </RequireLocation>
} />

{/* 🔥 NOVA ROTA */}
<Route path="/tracking/:id" element={
  <RequireLocation>
    <OrderTrackingPage />
  </RequireLocation>
} />

<Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LocationProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </CartProvider>
      </LocationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;