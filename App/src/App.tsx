import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import CartSidebar from "./components/CartSidebar";
import { allGames } from "./data/catalogData";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D0D]">
      <NavBar />
      <CartSidebar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog games={allGames} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;