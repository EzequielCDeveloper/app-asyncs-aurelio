import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CheckoutProgress from "../components/CheckoutProgress";
import TicketModal from "../components/TicketModal";
import StripePaymentForm from "../components/StripePaymentForm";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { submitOrder, validateConnection, validateInventory, savePurchase } from "../api";
import { stripePromise, createPaymentIntent } from "../stripe";

const STEP_MESSAGES = {
  0: { title: "Finalizar Compra", desc: "Revisa tu pedido antes de continuar.", icon: null },
  1: { title: "Validando conexión...", desc: "Verificando conexión con el servidor.", icon: "wifi" },
  2: { title: "Verificando disponibilidad...", desc: "Confirmando que todo esté en stock.", icon: "inventory_2" },
  3: { title: "Calculando total...", desc: "Aplicando impuestos y descuentos.", icon: "sync" },
  4: { title: "Enviando pedido...", desc: "Registrando tu orden en el sistema.", icon: "save" },
  5: { title: "Pago", desc: "Completa el pago con tu tarjeta.", icon: "credit_card" },
  6: { title: "Guardando compra...", desc: "Actualizando tu historial de compras.", icon: "history" },
  7: { title: "¡Compra completada!", desc: "Tu orden ha sido procesada exitosamente.", icon: "check_circle" },
};

export default function CheckoutPage() {
  const { items, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [showTicket, setShowTicket] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  // Redirect if no items or not logged in
  useEffect(() => {
    if (items.length === 0 && step === 0) {
      navigate("/");
    }
    if (!user && step === 0) {
      navigate("/login");
    }
  }, [items, user, step, navigate]);

  async function startCheckout() {
    setStep(1);
    setError(null);

    try {
      // Step 1: Validate connection
      await validateConnection();
      setStep(2);

      // Step 2: Validate inventory
      validateInventory(items);
      setStep(3);

      // Step 3: Calculate total — already in context, just advance
      setStep(4);

      // Step 4: Submit order to DummyJSON
      const orderResponse = await submitOrder(
        user.id,
        items.map((i) => ({ id: i.id, quantity: i.quantity }))
      );
      setOrder(orderResponse);
      setStep(5);

      // Step 5: Create PaymentIntent — StripePaymentForm is rendered below
      const secret = await createPaymentIntent(total);
      setClientSecret(secret);
      // User completes payment in the form; on success → step 6
    } catch (err) {
      setError(err.message);
    }
  }

  function handlePaymentSuccess() {
    // Step 6: Save purchase to localStorage
    savePurchase(order);
    setStep(6);

    // Step 7: Show ticket after brief delay for animation
    setTimeout(() => {
      setStep(7);
      setShowTicket(true);
    }, 500);
  }

  function handlePaymentError(msg) {
    setError(msg);
  }

  function handleRetry() {
    setError(null);
    setClientSecret(null);
    startCheckout();
  }

  return (
    <>
      <Header />

      <main className="flex-grow flex items-center justify-center py-stack-lg px-gutter-mobile md:px-gutter-desktop">
        <div className="w-full max-w-container-max md:max-w-3xl bg-surface-container-lowest rounded-xl shadow-md p-6 md:p-8 border border-border-subtle relative overflow-hidden">
          <div className="mb-8">
            <h1 className="font-headline-xl text-headline-xl text-primary mb-2">
              {STEP_MESSAGES[step]?.title || "Processing..."}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              {STEP_MESSAGES[step]?.desc}
            </p>
          </div>

          {/* Progress Bar */}
          {step > 0 && <CheckoutProgress currentStep={step} />}

          {/* Current State */}
          <div className="text-center py-8 bg-brand-cream rounded-xl border border-border-subtle mb-8">
            {error ? (
              <>
                <span className="material-symbols-outlined text-error text-4xl mb-4 fill">
                  error
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
                  Error en el proceso
                </h2>
                <p className="font-body-base text-body-base text-on-surface-variant mb-6">
                  {error}
                </p>
                <button
                  onClick={handleRetry}
                  className="bg-primary text-on-primary px-6 py-3 rounded-2xl font-label-bold text-label-bold hover:bg-primary-container transition-colors shadow-sm"
                >
                  Reintentar
                </button>
              </>
            ) : step === 5 && clientSecret ? (
              <div className="text-left">
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripePaymentForm
                    amount={total}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              </div>
            ) : step === 5 ? (
              <>
                <span
                  className="material-symbols-outlined text-secondary-container text-4xl mb-4 animate-spin"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  sync
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
                  Preparando pago...
                </h2>
                <p className="font-body-base text-body-base text-on-surface-variant">
                  Conectando con la pasarela de pago.
                </p>
              </>
            ) : step === 0 ? (
              <>
                <span className="material-symbols-outlined text-secondary-container text-4xl mb-4 fill">
                  shopping_cart_checkout
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
                  Listo para finalizar
                </h2>
                <p className="font-body-base text-body-base text-on-surface-variant mb-6">
                  {items.length} producto(s) por un total de ${total.toFixed(2)}
                </p>
                <button
                  onClick={startCheckout}
                  className="bg-primary text-on-primary px-8 py-4 rounded-2xl font-label-bold text-label-bold hover:bg-primary-container transition-colors shadow-sm text-lg"
                >
                  Finalizar Compra
                </button>
              </>
            ) : step === 7 ? (
              <>
                <span
                  className="material-symbols-outlined text-success text-4xl mb-4 fill"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
                  {STEP_MESSAGES[7].title}
                </h2>
                <p className="font-body-base text-body-base text-on-surface-variant">
                  {STEP_MESSAGES[7].desc}
                </p>
              </>
            ) : step >= 1 ? (
              <>
                <span
                  className="material-symbols-outlined text-secondary-container text-4xl mb-4 animate-spin"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {STEP_MESSAGES[step]?.icon || "sync"}
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
                  {STEP_MESSAGES[step]?.title}
                </h2>
                <p className="font-body-base text-body-base text-on-surface-variant">
                  {STEP_MESSAGES[step]?.desc}
                </p>
              </>
            ) : null}
          </div>

          {/* Order Summary Preview */}
          {step < 5 && (
          <div className="border-t border-border-subtle pt-6 border-dashed">
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-4">
              Resumen del Pedido
            </h3>
            <div className="space-y-4 opacity-70">
              {items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-surface-variant overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <div className="font-body-base text-body-base text-on-surface">
                        {item.name}
                      </div>
                      <div className="font-body-base text-sm text-on-surface-variant">
                        x{item.quantity} — ${item.price.toFixed(2)} c/u
                      </div>
                    </div>
                  </div>
                  <div className="font-body-base text-body-base text-on-surface font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
              {items.length > 3 && (
                <p className="text-center text-sm text-on-surface-variant">
                  +{items.length - 3} producto(s) más
                </p>
              )}
            </div>
          </div>
          )}
        </div>
      </main>

      <Footer />

      {showTicket && order && (
        <TicketModal order={order} onClose={() => setShowTicket(false)} />
      )}
    </>
  );
}
