import { loadStripe } from "@stripe/stripe-js";

const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const STRIPE_SERVER = import.meta.env.VITE_STRIPE_SERVER_URL || "http://localhost:3001";

export const stripePromise = loadStripe(STRIPE_PK);

export async function createPaymentIntent(amount) {
  const res = await fetch(`${STRIPE_SERVER}/create-payment-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, currency: "usd" }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error al crear el pago");
  }

  const data = await res.json();
  return data.clientSecret;
}
