import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function TicketModal({ order, onClose }) {
  const navigate = useNavigate();
  const { items, subtotal, discount, iva, total, dispatch } = useCart();

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function handleClose() {
    dispatch({ type: "CLEAR" });
    onClose?.();
    navigate("/");
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-surface-container-lowest rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-border-subtle"
        role="dialog"
        aria-modal="true"
        aria-label="Ticket de compra"
      >
        {/* Receipt-style header */}
        <div className="text-center p-6 border-b-2 border-dashed border-border-subtle">
          <div className="font-headline-xl text-headline-xl font-extrabold text-primary tracking-tighter mb-1">
            DotaBURGUERS
          </div>
          <p className="font-body-base text-body-base text-on-surface-variant">
            ¡Gracias por tu compra!
          </p>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Order info */}
          <div className="text-center mb-2">
            <p className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">
              Orden #{order?.id || "N/A"}
            </p>
            <p className="font-body-base text-body-base text-on-surface-variant mt-1">
              {dateStr} — {timeStr}
            </p>
          </div>

          {/* Items */}
          <div className="border-t border-border-subtle pt-4">
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-3">
              Productos
            </h3>
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <span className="font-body-base text-body-base text-on-surface">
                      {item.name}
                    </span>
                    <span className="font-body-base text-body-base text-on-surface-variant ml-2">
                      x{item.quantity}
                    </span>
                  </div>
                  <span className="font-body-base text-body-base text-on-surface font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-border-subtle pt-4 flex flex-col gap-2">
            <div className="flex justify-between font-body-base text-body-base text-on-surface-variant">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between font-body-base text-body-base text-success">
                <span>Descuento (10%)</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-body-base text-body-base text-on-surface-variant">
              <span>IVA (16%)</span>
              <span>${iva.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-headline-lg text-headline-lg text-primary font-black border-t border-border-subtle pt-2 mt-1">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-on-surface-variant border-t border-dashed border-border-subtle pt-4 mt-2">
            <p>Te enviaremos un correo de confirmación a tu email registrado.</p>
          </div>

          <button
            onClick={handleClose}
            className="mt-4 w-full bg-primary text-on-primary rounded-2xl font-label-bold text-label-bold px-6 py-4 hover:shadow-md hover:bg-primary-container focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
