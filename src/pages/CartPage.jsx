import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartItem from "../components/CartItem";
import CartSummary from "../components/CartSummary";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { items, dispatch } = useCart();
  const navigate = useNavigate();

  const handleClearCart = () => {
    if (window.confirm("¿Estás seguro de vaciar el carrito?")) {
      dispatch({ type: "CLEAR" });
    }
  };

  return (
    <>
      <Header />

      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop py-stack-lg">
        <div className="mb-stack-lg">
          <h1 className="font-headline-2xl text-headline-2xl text-on-background mb-2">
            Review Your Order
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Check your items before proceeding to checkout.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">
              shopping_cart
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
              Tu carrito está vacío
            </h2>
            <p className="font-body-base text-body-base text-on-surface-variant mb-6">
              Agrega productos del menú para empezar.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-primary text-on-primary px-6 py-3 rounded-2xl font-label-bold text-label-bold hover:bg-primary-container transition-colors shadow-sm"
            >
              Ver Menú
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={handleClearCart}
                className="text-on-surface-variant hover:text-error transition-colors font-body-base text-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-base">delete_sweep</span>
                Vaciar carrito
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-md lg:gap-6 items-start">
              <div className="lg:col-span-8 flex flex-col gap-stack-sm">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              <div className="lg:col-span-4 lg:sticky lg:top-[100px]">
                <CartSummary />
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
