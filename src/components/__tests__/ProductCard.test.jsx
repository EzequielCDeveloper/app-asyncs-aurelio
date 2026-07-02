import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
import { AuthProvider } from '../../context/AuthContext';
import ProductCard from '../ProductCard';

const product = {
  id: 1,
  name: 'Classic Mid Burger',
  description: 'A reliable classic.',
  price: 8.99,
  category: 'Burgers',
  badge: 'Popular',
  image: 'https://example.com/burger.jpg',
  alt: 'Classic burger',
};

const productNoBadge = {
  id: 2,
  name: 'Radiant Fries',
  description: 'Golden crispy fries.',
  price: 4.49,
  category: 'Sides',
  badge: null,
  image: 'https://example.com/fries.jpg',
  alt: 'Crispy fries',
};

function renderWithProviders(ui) {
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

describe('ProductCard', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders product name and price', () => {
    renderWithProviders(<ProductCard product={product} />);
    expect(screen.getByText('Classic Mid Burger')).toBeInTheDocument();
    expect(screen.getByText('$8.99')).toBeInTheDocument();
  });

  it('renders product description', () => {
    renderWithProviders(<ProductCard product={product} />);
    expect(screen.getByText('A reliable classic.')).toBeInTheDocument();
  });

  it('renders badge when present', () => {
    renderWithProviders(<ProductCard product={product} />);
    expect(screen.getByText('Popular')).toBeInTheDocument();
  });

  it('does not render badge when absent', () => {
    renderWithProviders(<ProductCard product={productNoBadge} />);
    expect(screen.queryByText('Popular')).not.toBeInTheDocument();
  });

  it('dispatches ADD_ITEM when add button is clicked', () => {
    renderWithProviders(<ProductCard product={product} />);

    const addButton = screen.getByLabelText(`Agregar ${product.name} al carrito`);
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);

    // Verify item was added to cart via localStorage persistence
    const storedCart = JSON.parse(localStorage.getItem('dotaburgers-cart'));
    expect(storedCart.items).toHaveLength(1);
    expect(storedCart.items[0].id).toBe(product.id);
    expect(storedCart.items[0].quantity).toBe(1);
  });

  it('increments quantity on second click', () => {
    renderWithProviders(<ProductCard product={product} />);

    const addButton = screen.getByLabelText(`Agregar ${product.name} al carrito`);
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    const storedCart = JSON.parse(localStorage.getItem('dotaburgers-cart'));
    expect(storedCart.items[0].quantity).toBe(2);
  });
});
