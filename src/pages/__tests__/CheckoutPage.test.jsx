import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import { CartProvider } from "../../context/CartContext";
import CheckoutPage from "../CheckoutPage";

// Mock Stripe modules — we test checkout pipeline, not payment UI
vi.mock("../../stripe", () => ({
  stripePromise: Promise.resolve(null),
  createPaymentIntent: vi.fn().mockResolvedValue("pi_test_secret_123"),
}));

vi.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }) => children,
  PaymentElement: () => null,
  useStripe: () => ({ confirmPayment: vi.fn().mockResolvedValue({}) }),
  useElements: () => ({ submit: vi.fn().mockResolvedValue({}) }),
}));

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const mockProduct = {
  id: 1,
  name: "Burger",
  price: 10,
  image: "burger.jpg",
  alt: "Burger",
  stock: 5,
  quantity: 1,
};

const mockOrderResponse = {
  id: 42,
  userId: 1,
  products: [{ id: 1, quantity: 1 }],
  total: 10,
};

function renderCheckout(items = [mockProduct], user = null) {
  // Set auth state via localStorage
  if (user) {
    localStorage.setItem(
      "dotaburgers-user",
      JSON.stringify({ id: 1, username: "test", firstName: "Test" })
    );
  }

  // Set cart items via localStorage
  if (items.length) {
    localStorage.setItem(
      "dotaburgers-cart",
      JSON.stringify({ version: 2, items })
    );
  }

  return render(
    <MemoryRouter initialEntries={["/checkout"]}>
      <AuthProvider>
        <CartProvider>
          <CheckoutPage />
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("CheckoutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    navigateMock.mockClear();
    global.fetch.mockReset();
  });

  it("renders the initial state with Finalizar Compra button", async () => {
    renderCheckout([mockProduct], true);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /finalizar compra/i })
      ).toBeInTheDocument();
    });
  });

  it("redirects to / when cart is empty and no step is active", async () => {
    renderCheckout([], false);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/");
    });
  });

  it("redirects to /login when not authenticated and no step is active", async () => {
    renderCheckout([mockProduct], false);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/login");
    });
  });

  it("executes full checkout pipeline and shows ticket on success", async () => {
    // Mock fetch for validateConnection (step 1)
    global.fetch.mockResolvedValueOnce({ ok: true });
    // Mock fetch for submitOrder (step 4)
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockOrderResponse),
    });

    renderCheckout([mockProduct], true);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /finalizar compra/i })
      ).toBeInTheDocument();
    });

    await act(async () => {
      screen.getByRole("button", { name: /finalizar compra/i }).click();
    });

    // Should reach step 5 and show the Pagar button
    let payButton;
    await waitFor(() => {
      payButton = screen.getByRole("button", { name: /pagar/i });
      expect(payButton).toBeInTheDocument();
    });

    // Click Pagar to complete payment
    await act(async () => {
      payButton.click();
    });

    // Should reach step 7 and show ticket
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: /compra completada/i })
      ).toBeInTheDocument();
    });

    // Ticket modal should be visible
    await waitFor(() => {
      expect(
        screen.getByRole("dialog", { name: /ticket de compra/i })
      ).toBeInTheDocument();
    });

    // Verify the two fetch calls: validateConnection and submitOrder
    // (createPaymentIntent is module-mocked, not via global.fetch)
    expect(global.fetch).toHaveBeenCalledTimes(2);
    // Last call should be the POST to /carts/add
    const lastCall = global.fetch.mock.calls[1];
    expect(lastCall[0]).toBe("https://dummyjson.com/carts/add");
    expect(lastCall[1]?.method).toBe("POST");
  });

  it("shows inventory error when item has zero stock", async () => {
    // Mock validateConnection (step 1) so we can reach validateInventory (step 2)
    global.fetch.mockResolvedValueOnce({ ok: true });

    const outOfStockItem = { ...mockProduct, stock: 0, quantity: 1 };
    renderCheckout([outOfStockItem], true);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /finalizar compra/i })
      ).toBeInTheDocument();
    });

    await act(async () => {
      screen.getByRole("button", { name: /finalizar compra/i }).click();
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Producto Burger no tiene stock disponible/i)
      ).toBeInTheDocument();
    });
  });

  it("shows inventory error when quantity exceeds stock", async () => {
    // Mock validateConnection (step 1) so we can reach validateInventory (step 2)
    global.fetch.mockResolvedValueOnce({ ok: true });

    const lowStockItem = { ...mockProduct, stock: 2, quantity: 5 };
    renderCheckout([lowStockItem], true);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /finalizar compra/i })
      ).toBeInTheDocument();
    });

    await act(async () => {
      screen.getByRole("button", { name: /finalizar compra/i }).click();
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          /Producto Burger supera el stock disponible/i
        )
      ).toBeInTheDocument();
    });
  });

  it("shows connection error and allows retry", async () => {
    // First call (validateConnection) fails
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    renderCheckout([mockProduct], true);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /finalizar compra/i })
      ).toBeInTheDocument();
    });

    await act(async () => {
      screen.getByRole("button", { name: /finalizar compra/i }).click();
    });

    await waitFor(() => {
      expect(screen.getByText(/Reintentar/i)).toBeInTheDocument();
    });

    // Now mock success for retry
    global.fetch.mockResolvedValueOnce({ ok: true });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockOrderResponse),
    });

    await act(async () => {
      screen.getByRole("button", { name: /reintentar/i }).click();
    });

    // Payment step: click Pagar
    let payButton;
    await waitFor(() => {
      payButton = screen.getByRole("button", { name: /pagar/i });
      expect(payButton).toBeInTheDocument();
    });

    await act(async () => {
      payButton.click();
    });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: /compra completada/i })
      ).toBeInTheDocument();
    });
  });

  it("shows order submission error", async () => {
    // validateConnection succeeds
    global.fetch.mockResolvedValueOnce({ ok: true });
    // submitOrder fails
    global.fetch.mockResolvedValueOnce({ ok: false });

    renderCheckout([mockProduct], true);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /finalizar compra/i })
      ).toBeInTheDocument();
    });

    await act(async () => {
      screen.getByRole("button", { name: /finalizar compra/i }).click();
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Error al guardar el pedido/i)
      ).toBeInTheDocument();
    });
  });
});
