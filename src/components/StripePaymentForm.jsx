import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function StripePaymentForm({ amount, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message);
      setLoading(false);
      onError?.(submitError.message);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout`,
        payment_method_data: {
          billing_details: {
            name: "Cliente DotaBURGUERS",
          },
        },
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message);
      setLoading(false);
      onError?.(confirmError.message);
      return;
    }

    // Payment succeeded (redirect=if_required means we stay on page)
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-border-subtle shadow-sm mb-4">
        <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-4">
          Pago con Tarjeta
        </h3>
        <p className="font-body-base text-body-base text-on-surface-variant mb-6">
          Total a pagar: <strong className="text-primary">${amount.toFixed(2)}</strong>
        </p>
        <PaymentElement />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-error font-body-base text-sm mb-4 p-3 bg-error/10 rounded-xl">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-primary text-on-primary rounded-2xl font-label-bold text-label-bold px-8 py-4 hover:bg-primary-container transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="material-symbols-outlined animate-spin">sync</span>
            Procesando pago...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined">lock</span>
            Pagar ${amount.toFixed(2)}
          </>
        )}
      </button>

      <p className="text-center text-xs text-on-surface-variant mt-4">
        Pago seguro procesado por Stripe. No guardamos datos de tarjeta.
      </p>
    </form>
  );
}
