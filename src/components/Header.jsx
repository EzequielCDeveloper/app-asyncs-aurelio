import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import MobileDrawer from "./MobileDrawer";

export default function Header({ showSearch = false, searchTerm, onSearchChange }) {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 w-full z-50 flex justify-between items-center px-gutter-mobile md:px-gutter-desktop h-16 bg-surface shadow-sm">
      <Link to="/" className="flex items-center gap-stack-md no-underline">
        <span className="text-headline-lg-mobile md:text-headline-lg font-headline-lg-mobile md:font-headline-lg font-extrabold text-primary tracking-tighter cursor-pointer">
          DotaBURGUERS
        </span>
      </Link>

      {showSearch && (
        <div className="hidden md:flex flex-1 max-w-md mx-gutter-desktop">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              value={searchTerm || ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search for burgers, sides..."
              className="w-full bg-surface-container-low border border-border-subtle rounded-2xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-stack-md">
        {/* Hamburger button — mobile only */}
        <button
          ref={hamburgerRef}
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden p-2 text-on-surface hover:bg-surface-variant/50 transition-colors rounded-full active:scale-95"
          aria-label="Abrir menú de navegación"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-drawer"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <Link
          to="/carrito"
          className="relative p-2 text-on-surface hover:bg-surface-variant/50 transition-colors rounded-full active:scale-95"
          aria-label="Carrito de compras"
        >
          <span className="material-symbols-outlined">shopping_cart</span>
          {totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-primary text-on-primary text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-surface">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => (user ? setMenuOpen(!menuOpen) : navigate("/login"))}
            className="p-2 text-on-surface hover:bg-surface-variant/50 transition-colors rounded-full active:scale-95 flex items-center gap-2"
            aria-label={user ? `Usuario: ${user.firstName}` : "Iniciar sesión"}
          >
            {user?.image ? (
              <img
                src={user.image}
                alt={user.firstName}
                className="w-8 h-8 rounded-full object-cover border-2 border-primary"
              />
            ) : (
              <span className="material-symbols-outlined">account_circle</span>
            )}
            {user && (
              <span className="hidden md:inline font-label-bold text-label-bold text-on-surface">
                {user.firstName}
              </span>
            )}
          </button>

          {menuOpen && user && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-2xl shadow-md border border-border-subtle p-2 animate-fade-in">
              <div className="px-3 py-2 border-b border-border-subtle mb-1">
                <p className="font-label-bold text-label-bold text-on-surface">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-on-surface-variant truncate">{user.email}</p>
              </div>
              <button
                onClick={() => { logout(); setMenuOpen(false); navigate("/"); }}
                className="w-full text-left px-3 py-2 rounded-xl text-on-surface-variant hover:bg-surface-variant transition-colors font-body-base text-sm"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        toggleRef={hamburgerRef}
      />
    </header>
  );
}
