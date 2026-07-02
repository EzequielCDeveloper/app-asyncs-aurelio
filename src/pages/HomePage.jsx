import { useState, useMemo, useEffect, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import SplashScreen from "../components/SplashScreen";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { fetchProducts } from "../api";
import { normalizeProduct } from "../utils";

const SKELETON_COUNT = 8;

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [sortBy, setSortBy] = useState("featured");
  const [showSplash, setShowSplash] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { dispatch } = useCart();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchProducts();
      const normalized = raw.map(normalizeProduct);
      setProducts(normalized);
    } catch (err) {
      setError(err.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (activeCategory !== "Todas") {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return result;
  }, [searchTerm, activeCategory, sortBy, products]);

  const categories = useMemo(() => {
    const unique = [...new Set(products.map((p) => p.category))];
    return ["Todas", ...unique.sort()];
  }, [products]);

  function handleSplashFinish() {
    setShowSplash(false);
  }

  function handleRetry() {
    loadProducts();
  }

  function renderContent() {
    if (loading) {
      return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <div
              key={i}
              className="bg-surface rounded-2xl p-4 shadow-sm flex flex-col gap-3 border border-border-subtle"
            >
              <div className="skeleton-shimmer w-full aspect-square rounded-xl" />
              <div className="skeleton-shimmer h-5 w-3/4 rounded" />
              <div className="skeleton-shimmer h-4 w-full rounded" />
              <div className="skeleton-shimmer h-4 w-1/2 rounded" />
            </div>
          ))}
        </section>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-5xl text-error mb-4 fill">
            error
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
            Error al cargar productos
          </h2>
          <p className="font-body-base text-body-base text-on-surface-variant mb-6">
            {error}
          </p>
          <button
            onClick={handleRetry}
            className="bg-primary text-on-primary px-6 py-3 rounded-2xl font-label-bold text-label-bold hover:bg-primary-container transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-brand-cream"
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (filtered.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">
            search_off
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
            No se encontraron productos
          </h2>
          <p className="font-body-base text-body-base text-on-surface-variant">
            Intenta con otros términos de búsqueda o categoría.
          </p>
        </div>
      );
    }

    return (
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    );
  }

  return (
    <>
      <Header showSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="flex-1 w-full max-w-container-max mx-auto p-4 md:p-8 flex flex-col gap-6 md:gap-8">
        {/* Hero Banner */}
        <section className="w-full h-64 md:h-96 rounded-2xl overflow-hidden relative group">
          <div
            className="bg-cover bg-center w-full h-full absolute inset-0 transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDs7P0zGWvjPgjX4AY97T-BnWYVVaVF9xuiolS5RbsJpWPtpXlH4oSb8yMpP7zpgsbvfkOAuGo0s2_8wu0j2DFks47h8j9YbJ5rPJfQZ-2ccwhPq6A0MGPB6cLWTc6t5huczrZOY0igaVy1Qrz0S029m79EZialXgFFYCCDOVAbjM4ysLU2sWGSEOWfdh2vrniphsSfHUzlJa5hm_ODD8Npx_i-qToaNsTMs89vg2lJ_pN20iUD3jhl2XtwtkciZjL5OIx6B8M0EifF')",
            }}
            role="img"
            aria-label="Delicious double cheeseburger close-up"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 md:p-8">
            <h1 className="text-headline-xl md:text-headline-2xl font-headline-xl md:font-headline-2xl text-white mb-2 shadow-sm">
              Taste the Victory.
            </h1>
            <p className="text-body-lg font-body-lg text-white/90 max-w-lg mb-4">
              Crafted for champions. Our new Double Aegis Burger is here for a limited time.
            </p>
            <button className="bg-primary text-on-primary px-6 py-3 rounded-2xl font-label-bold text-label-bold w-max hover:bg-primary-container transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-brand-cream">
              Order Now
            </button>
          </div>
        </section>

        {/* Category + Sort Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-16 z-40 bg-brand-cream/90 backdrop-blur-md py-4 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex overflow-x-auto pb-2 w-full md:w-auto hide-scrollbar gap-2 scroll-smooth">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-2xl font-label-bold text-label-bold whitespace-nowrap shadow-sm transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-on-primary"
                    : "bg-surface text-on-surface border border-border-subtle hover:border-primary hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-48 appearance-none bg-surface border border-border-subtle text-on-surface py-2 pl-4 pr-10 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-base"
            >
              <option value="featured">Ordenar por: Destacados</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="name-asc">Nombre: A-Z</option>
              <option value="name-desc">Nombre: Z-A</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
              expand_more
            </span>
          </div>
        </div>

        {/* Content: Loading → Error → Empty → Grid */}
        {renderContent()}
      </main>

      <Footer />

      {/* Splash overlay — rendered last to stack above z-50 header */}
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
    </>
  );
}
