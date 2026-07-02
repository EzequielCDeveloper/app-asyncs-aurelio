import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
import { AuthProvider } from '../../context/AuthContext';
import CartItem from '../CartItem';

const item = {
  id: 1,
  name: 'Classic Mid Burger',
  description: 'A reliable classic.',
  price: 8.99,
  quantity: 2,
  image: 'https://example.com/burger.jpg',
  alt: 'Classic burger',
};

function renderWithProviders(ui, { cartItems = [item] } = {}) {
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

describe('CartItem', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders item name', () => {
    renderWithProviders(<CartItem item={item} />);
    expect(screen.getByText('Classic Mid Burger')).toBeInTheDocument();
  });

  it('renders quantity display', () => {
    renderWithProviders(<CartItem item={item} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders line total price', () => {
    renderWithProviders(<CartItem item={item} />);
    expect(screen.getByText('$17.98')).toBeInTheDocument();
  });

  it('increment button dispatches INCREMENT', () => {
    renderWithProviders(<CartItem item={item} />);

    fireEvent.click(screen.getByLabelText('Aumentar cantidad'));

    const storedCart = JSON.parse(localStorage.getItem('dotaburgers-cart'));
    expect(storedCart.items[0].quantity).toBe(3);
  });

  it('decrement button dispatches DECREMENT', () => {
    renderWithProviders(<CartItem item={item} />);

    fireEvent.click(screen.getByLabelText('Disminuir cantidad'));

    const storedCart = JSON.parse(localStorage.getItem('dotaburgers-cart'));
    expect(storedCart.items[0].quantity).toBe(1);
  });

  it('delete button dispatches REMOVE_ITEM', () => {
    renderWithProviders(<CartItem item={item} />);

    fireEvent.click(screen.getByLabelText(`Eliminar ${item.name}`));

    const storedCart = JSON.parse(localStorage.getItem('dotaburgers-cart'));
    expect(storedCart.items).toHaveLength(0);
  });

  it('removes item when decrement to 0', () => {
    const singleItem = { ...item, quantity: 1 };
    renderWithProviders(<CartItem item={singleItem} />, { cartItems: [singleItem] });

    fireEvent.click(screen.getByLabelText('Disminuir cantidad'));

    const storedCart = JSON.parse(localStorage.getItem('dotaburgers-cart'));
    expect(storedCart.items).toHaveLength(0);
  });
});
