import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CartProvider } from "../../context/CartContext";
import { AuthProvider } from "../../context/AuthContext";
import MobileDrawer from "../MobileDrawer";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const mockUser = {
  id: 1,
  username: "emilys",
  firstName: "Emily",
  lastName: "Johnson",
  email: "emily@example.com",
  image: "https://example.com/avatar.jpg",
};

function renderWithProviders(ui, { cartItems = [], user = null } = {}) {
  if (user) {
    localStorage.setItem("dotaburgers-user", JSON.stringify(user));
  }
  if (cartItems.length > 0) {
    localStorage.setItem("dotaburgers-cart", JSON.stringify(cartItems));
  }

  return render(
    <MemoryRouter>
      <AuthProvider>
        <CartProvider>{ui}</CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("MobileDrawer", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders drawer when isOpen is true", () => {
    renderWithProviders(<MobileDrawer isOpen={true} onClose={vi.fn()} />);

    const drawer = screen.getByRole("dialog");
    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveAttribute("aria-modal", "true");
    expect(drawer).toHaveAttribute("aria-label", "Menú de navegación");
  });

  it("is hidden when isOpen is false", () => {
    renderWithProviders(<MobileDrawer isOpen={false} onClose={vi.fn()} />);

    const drawer = screen.getByRole("dialog");
    expect(drawer.className).toContain("translate-x-full");
    expect(drawer).toHaveAttribute("aria-modal", "false");
  });

  it("renders navigation links (Inicio, Menú, Carrito)", () => {
    renderWithProviders(<MobileDrawer isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("Menú")).toBeInTheDocument();
    expect(screen.getByText("Carrito")).toBeInTheDocument();
  });

  it("renders close button", () => {
    renderWithProviders(<MobileDrawer isOpen={true} onClose={vi.fn()} />);

    const closeButton = screen.getByLabelText("Cerrar menú");
    expect(closeButton).toBeInTheDocument();
    expect(closeButton.querySelector(".material-symbols-outlined")).toHaveTextContent(
      "close"
    );
  });

  it("calls onClose when overlay backdrop is clicked", () => {
    const onClose = vi.fn();
    const { container } = renderWithProviders(
      <MobileDrawer isOpen={true} onClose={onClose} />
    );

    // The overlay is the element with aria-hidden="true" (the backdrop)
    const overlay = container.querySelector('[aria-hidden="true"]');
    expect(overlay).toBeInTheDocument();

    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    renderWithProviders(<MobileDrawer isOpen={true} onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("displays cart badge with item count", () => {
    const cartItems = [
      { id: 1, name: "Burger", price: 10, quantity: 2 },
      { id: 2, name: "Fries", price: 5, quantity: 1 },
    ];
    renderWithProviders(<MobileDrawer isOpen={true} onClose={vi.fn()} />, {
      cartItems,
    });

    const badge = screen.getByText("3");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-primary");
  });

  it("shows user info and logout when authenticated", async () => {
    renderWithProviders(<MobileDrawer isOpen={true} onClose={vi.fn()} />, {
      user: mockUser,
    });

    expect(await screen.findByText("Emily Johnson")).toBeInTheDocument();
    expect(screen.getByText("emily@example.com")).toBeInTheDocument();

    const logoutBtn = screen.getByText("Cerrar sesión");
    expect(logoutBtn).toBeInTheDocument();
  });

  it("shows login link when not authenticated", () => {
    renderWithProviders(<MobileDrawer isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText("Iniciar sesión")).toBeInTheDocument();
    expect(screen.queryByText("Cerrar sesión")).not.toBeInTheDocument();
  });

  it("closes drawer on navigation link click", () => {
    const onClose = vi.fn();
    renderWithProviders(<MobileDrawer isOpen={true} onClose={onClose} />);

    const inicioBtn = screen.getByText("Inicio");
    fireEvent.click(inicioBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows close button with proper accessibility label", () => {
    renderWithProviders(<MobileDrawer isOpen={true} onClose={vi.fn()} />);

    const hamburger = screen.getByLabelText("Cerrar menú");
    expect(hamburger).toBeInTheDocument();
  });
});
