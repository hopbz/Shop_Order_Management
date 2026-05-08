import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./hooks/useToast";
import { BackendStatusProvider } from "./hooks/useBackendStatus";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ProductsPage from "./pages/ProductsPage";
import CreateProductPage from "./pages/CreateProductPage";
import CustomersPage from "./pages/CustomersPage";
import OrdersPage from "./pages/OrdersPage";
import CreateOrderPage from "./pages/CreateOrderPage";
import OrderDetailPage from "./pages/OrderDetailPage";

export default function App() {
  return (
    <BackendStatusProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/new" element={<CreateProductPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/new" element={<CreateOrderPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </BackendStatusProvider>
  );
}
