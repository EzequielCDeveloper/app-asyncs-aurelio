import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
import { AuthProvider } from '../../context/AuthContext';
import Header from '../Header';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const mockUser = {
  id: 1,
  username: 'emilys',
  firstName: 'Emily',
  lastName: 'Johnson',
  email: 'emily@example.com',
  image: 'https://example.com/avatar.jpg',
};

function renderWithProviders(ui, { cartItems = [], user = null } = {}) {
  if (user) {
    localStorage.setItem('dotaburgers-user', JSON.stringify(user));
  }
  if (cartItems.length > 0) {
    localStorage.setItem('dotaburgers-cart', JSON.stringify(cartItems));
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

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders logo text', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('DotaBURGUERS')).toBeInTheDocument();
  });

  it('renders cart icon without badge when cart is empty', () => {
    renderWithProviders(<Header />);
    const cartLink = screen.getByLabelText('Carrito de compras');
    expect(cartLink).toBeInTheDocument();
    // Badge should not exist when totalItems is 0
    expect(cartLink.querySelector('.absolute')).not.toBeInTheDocument();
  });

  it('shows cart badge with item count', () => {
    const cartItems = [
      { id: 1, name: 'Burger', price: 10, quantity: 2 },
      { id: 2, name: 'Fries', price: 5, quantity: 1 },
    ];
    renderWithProviders(<Header />, { cartItems });
    const cartLink = screen.getByLabelText('Carrito de compras');
    expect(cartLink).toBeInTheDocument();
    expect(cartLink.textContent).toContain('3');
  });

  it('shows user avatar when logged in', async () => {
    renderWithProviders(<Header />, { user: mockUser });

    // Wait for AuthProvider to hydrate from localStorage
    const userBtn = await screen.findByLabelText('Usuario: Emily');
    expect(userBtn).toBeInTheDocument();

    const avatar = userBtn.querySelector('img');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', mockUser.image);
  });

  it('shows search input when showSearch is true', () => {
    renderWithProviders(<Header showSearch />);
    const searchInput = screen.getByPlaceholderText('Search for burgers, sides...');
    expect(searchInput).toBeInTheDocument();
  });

  it('hides search input when showSearch is false', () => {
    renderWithProviders(<Header showSearch={false} />);
    expect(
      screen.queryByPlaceholderText('Search for burgers, sides...')
    ).not.toBeInTheDocument();
  });

  it('renders user first name when logged in', async () => {
    renderWithProviders(<Header />, { user: mockUser });

    const userName = await screen.findByText('Emily');
    expect(userName).toBeInTheDocument();
  });
});
