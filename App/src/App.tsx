import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import GameDetail from "./pages/GameDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import WorkInProgress from "./pages/WorkInProgress";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import CartSidebar from "./components/CartSidebar";
import ScrollToTop from "./components/ScrollToTop";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { AdminRoute } from "@/features/auth/AdminRoute";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D0D]">
      <ScrollToTop />
      <NavBar />
      <CartSidebar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/game/:id" element={<GameDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/deals" element={<WorkInProgress />} />
          <Route path="/library" element={<WorkInProgress />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Auth Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/orders" element={<Orders />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
