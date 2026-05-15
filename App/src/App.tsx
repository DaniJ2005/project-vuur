import { useState, useCallback } from "react";

// Pages
import Home from "./pages/Home";
import Catalog from "./pages/Catalog"

// Components
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import CartSidebar, { type CartItem, cartCount, type CartGame } from "./components/CartSidebar";

// Data
import { FeaturedGames, NewReleases, Platforms, USPs } from "./data/homeData";
import { allGames } from "./data/catalogData";


// ── Cart state logic ───────────────────────────────────────────────────────────
// Kept here so any page rendered under <main> can receive cart actions as props
// or via a context if the project grows. For now, App owns the single source of truth.

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Add a game (or bump quantity if already present)
  const addToCart = useCallback((game: CartGame) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.game.id === game.id);
      if (existing) {
        return prev.map((i) =>
          i.game.id === game.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { game, quantity: 1 }];
    });
  }, []);

  // Change quantity by delta; removes item when quantity reaches 0
  const changeQty = useCallback((gameId: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) => (i.game.id === gameId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((gameId: number) => {
    setCartItems((prev) => prev.filter((i) => i.game.id !== gameId));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D0D]">
      <NavBar
        cartCount={cartCount(cartItems)}
        onCartOpen={() => setCartOpen(true)}
      />

      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onChangeQty={changeQty}
        onRemove={removeFromCart}
      />

      <main className="flex-1">
        {/* <Home
          FeaturedGames={allGames.slice(0, 4)}
          NewReleases={NewReleases}
          Platforms={Platforms}
          USPs={USPs}
          // Pass addToCart down so game cards can call it:
          addToCart={addToCart}
        /> */}

        <Catalog
          games={allGames}
          onAddToCart={addToCart}
        />
      </main>

      <Footer />
    </div>
  );
}

export default App;