import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CartSummary() {
  const { items, subtotal, discount, iva, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  function handleCheckout() {
    if (user) {
      navigate("/checkout");
    } else {
      navigate("/login");
    }
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-border-subtle p-6 flex flex-col gap-6">
      <h2 className="font-headline-xl text-headline-xl text-on-background border-b border-border-subtle pb-4">
        Resumen del Pedido
      </h2>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center font-body-base text-body-base text-on-surface-variant">
          <span>Subtotal ({totalQty} items)</span>
          <span className="font-bold text-on-background">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center font-body-base text-body-base text-on-surface-variant">
          <span>IVA (16%)</span>
          <span className="font-bold text-on-background">${iva.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between items-center font-body-base text-body-base text-success bg-success/10 p-2 rounded-lg -mx-2 px-2">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">loyalty</span>
              Descuento por Mayoreo (10%)
            </span>
            <span className="font-bold">-${discount.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-border-subtle pt-4 mt-2">
        <div className="flex justify-between items-end">
          <span className="font-headline-lg text-headline-lg text-on-background">Total</span>
          <span className="font-headline-2xl text-headline-2xl text-primary font-black">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <button
          onClick={handleCheckout}
          className="bg-primary text-on-primary rounded-2xl font-label-bold text-label-bold px-6 py-4 w-full hover:shadow-md hover:bg-primary-container focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all flex justify-center items-center gap-2"
        >
          Finalizar Compra
          <span className="material-symbols-outlined text-xl">arrow_forward</span>
        </button>

        <button
          onClick={() => navigate("/")}
          className="text-primary font-label-bold text-label-bold text-center py-3 hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded-lg transition-all"
        >
          Seguir Comprando
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-on-surface-variant font-body-base text-sm mt-2 opacity-70">
        <span className="material-symbols-outlined text-sm">lock</span>
        <span>Pago Seguro</span>
      </div>
    </div>
  );
}
