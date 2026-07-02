import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef } from "react";

export default function MobileDrawer({ isOpen, onClose, toggleRef }) {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Escape key closes the drawer
  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Focus trap: focus cycles within the drawer when open
  useEffect(() => {
    if (!isOpen) return;

    // Focus the close button when drawer opens
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    function handleTab(e) {
      if (e.key !== "Tab") return;
      const drawer = drawerRef.current;
      if (!drawer) return;

      const focusable = drawer.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleTab);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleTab);
    };
  }, [isOpen]);

  // Restore focus to hamburger toggle when drawer closes
  useEffect(() => {
    if (!isOpen && toggleRef?.current) {
      toggleRef.current.focus();
    }
  }, [isOpen, toggleRef]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function handleNavClick(path) {
    onClose();
    navigate(path);
  }

  function handleLogout() {
    logout();
    onClose();
    navigate("/");
  }

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        id="mobile-drawer"
        role="dialog"
        aria-modal={isOpen ? "true" : "false"}
        aria-label="Menú de navegación"
        className={`fixed top-0 right-0 h-full w-72 bg-surface-container-lowest shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 text-on-surface hover:bg-surface-variant/50 transition-colors rounded-full"
            aria-label="Cerrar menú"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 flex flex-col px-4 space-y-1">
          <button
            onClick={() => handleNavClick("/")}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface hover:bg-surface-variant/50 transition-colors font-body-base"
          >
            <span className="material-symbols-outlined text-on-surface-variant">
              home
            </span>
            Inicio
          </button>
          <button
            onClick={() => handleNavClick("/")}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface hover:bg-surface-variant/50 transition-colors font-body-base"
          >
            <span className="material-symbols-outlined text-on-surface-variant">
              restaurant_menu
            </span>
            Menú
          </button>
          <Link
            to="/carrito"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface hover:bg-surface-variant/50 transition-colors font-body-base no-underline"
          >
            <span className="material-symbols-outlined text-on-surface-variant">
              shopping_cart
            </span>
            <span className="flex-1">Carrito</span>
            {totalItems > 0 && (
              <span className="bg-primary text-on-primary text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
        </nav>

        {/* User section at bottom */}
        <div className="border-t border-border-subtle p-4">
          {user ? (
            <div>
              <div className="mb-3 px-3">
                <p className="font-label-bold text-label-bold text-on-surface">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-on-surface-variant truncate">
                  {user.email}
                </p>
              </div>
              <button
                onClick={() => handleNavClick("/mis-compras")}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-on-surface hover:bg-surface-variant/50 transition-colors font-body-base"
              >
                <span className="material-symbols-outlined text-on-surface-variant">receipt_long</span>
                Mis Compras
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-variant/50 transition-colors font-body-base"
              >
                <span className="material-symbols-outlined">logout</span>
                Cerrar sesión
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-on-surface hover:bg-surface-variant/50 transition-colors font-body-base no-underline"
            >
              <span className="material-symbols-outlined text-on-surface-variant">
                login
              </span>
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
