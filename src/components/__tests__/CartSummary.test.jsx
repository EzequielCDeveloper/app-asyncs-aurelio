import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
import { AuthProvider } from '../../context/AuthContext';
import CartSummary from '../CartSummary';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const cartItems = [
  { id: 1, name: 'Burger', price: 10, quantity: 2, image: 'a.jpg', alt: 'a' },
  { id: 2, name: 'Fries', price: 5, quantity: 2, image: 'b.jpg', alt: 'b' },
];

const expensiveItems = [
  { id: 1, name: 'Premium Burger', price: 300, quantity: 2, image: 'a.jpg', alt: 'a' },
];

const mockUser = {
  id: 1, username: 'emilys', firstName: 'Emily', lastName: 'Johnson',
  email: 'e@e.com', image: 'x.jpg',
};

function renderWithProviders(ui, { cart = cartItems, user = null } = {}) {
  localStorage.clear();
  if (user) {
    localStorage.setItem('dotaburgers-user', JSON.stringify(user));
  }
  if (cart.length > 0) {
    localStorage.setItem('dotaburgers-cart', JSON.stringify(cart));
  }

  return render(
    <MemoryRouter>
      <AuthProvider>
        <CartProvider>
          {ui}
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('CartSummary', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders subtotal, IVA, and total', () => {
    // Cart: 2x$10 + 2x$5 = $30 subtotal
    renderWithProviders(<CartSummary />);

    expect(screen.getByText('$30.00')).toBeInTheDocument();
    // IVA = (30 - 0) * 0.16 = 4.80
    expect(screen.getByText('$4.80')).toBeInTheDocument();
    // Total = 30 - 0 + 4.80 = 34.80
    expect(screen.getByText('$34.80')).toBeInTheDocument();
  });

  it('shows items count in subtotal label', () => {
    renderWithProviders(<CartSummary />);
    expect(screen.getByText(/Subtotal \(4 items\)/)).toBeInTheDocument();
  });

  it('does not show discount when subtotal is under 500', () => {
    renderWithProviders(<CartSummary />);
    expect(screen.queryByText(/Descuento/)).not.toBeInTheDocument();
  });

  it('shows discount when subtotal exceeds 500', () => {
    // 2 x $300 = $600 subtotal, discount = $60
    renderWithProviders(<CartSummary />, { cart: expensiveItems });

    expect(screen.getByText(/Descuento/)).toBeInTheDocument();
    expect(screen.getByText(/-?\$60\.00/)).toBeInTheDocument();
  });

  it('checkout button navigates to /login when not authenticated', () => {
    renderWithProviders(<CartSummary />, { user: null });

    fireEvent.click(screen.getByText('Finalizar Compra'));

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('checkout button navigates to /checkout when authenticated', async () => {
    renderWithProviders(<CartSummary />, { user: mockUser });

    // Wait for AuthProvider to restore user
    const checkoutBtn = screen.getByText('Finalizar Compra');
    fireEvent.click(checkoutBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/checkout');
  });

  it('renders Seguir Comprando button that navigates to /', () => {
    renderWithProviders(<CartSummary />);

    fireEvent.click(screen.getByText('Seguir Comprando'));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
