import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
import { AuthProvider } from '../../context/AuthContext';
import HomePage from '../../pages/HomePage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock SplashScreen to be instant (no 2s timer) for tests
vi.mock('../../components/SplashScreen', () => ({
  default: function MockSplash({ onFinish }) {
    if (onFinish) queueMicrotask(onFinish);
    return null;
  },
}));

const MOCK_API_PRODUCTS = [
  {
    id: 1,
    title: 'Classic Burger',
    description: 'A reliable classic.',
    price: 8.99,
    category: 'electronics',
    image: 'https://example.com/burger.jpg',
    rating: { rate: 4.5, count: 100 },
  },
  {
    id: 2,
    title: 'Radiant Fries',
    description: 'Golden crispy fries.',
    price: 4.49,
    category: 'jewelery',
    image: 'https://example.com/fries.jpg',
    rating: { rate: 4.0, count: 50 },
  },
  {
    id: 3,
    title: 'Dire Chocolate Shake',
    description: 'Rich dark chocolate.',
    price: 5.99,
    category: "men's clothing",
    image: 'https://example.com/shake.jpg',
    rating: { rate: 3.5, count: 75 },
  },
];

function renderWithProviders() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <CartProvider>
          <HomePage />
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('HomePage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_API_PRODUCTS),
    });
  });

  it('renders all products initially (Todas category)', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('Classic Burger')).toBeInTheDocument();
    });
    expect(screen.getByText('Radiant Fries')).toBeInTheDocument();
    expect(screen.getByText('Dire Chocolate Shake')).toBeInTheDocument();
  });

  it('filters products by category', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('Classic Burger')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Hamburguesas' }));

    expect(screen.getByText('Classic Burger')).toBeInTheDocument();
    expect(screen.queryByText('Radiant Fries')).not.toBeInTheDocument();
    expect(screen.queryByText('Dire Chocolate Shake')).not.toBeInTheDocument();
  });

  it('filters to Sides category correctly', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('Radiant Fries')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Acompañamientos' }));

    expect(screen.getByText('Radiant Fries')).toBeInTheDocument();
    expect(screen.queryByText('Classic Burger')).not.toBeInTheDocument();
  });

  it('filters products by search term', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('Radiant Fries')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar hamburguesas, acompañamientos...');
    fireEvent.change(searchInput, { target: { value: 'Fries' } });

    expect(screen.getByText('Radiant Fries')).toBeInTheDocument();
    expect(screen.queryByText('Classic Burger')).not.toBeInTheDocument();
  });

  it('filters by both category and search', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('Classic Burger')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Hamburguesas' }));

    const searchInput = screen.getByPlaceholderText('Buscar hamburguesas, acompañamientos...');
    fireEvent.change(searchInput, { target: { value: 'Burger' } });

    expect(screen.getByText('Classic Burger')).toBeInTheDocument();
    expect(screen.queryByText('Radiant Fries')).not.toBeInTheDocument();
    expect(screen.queryByText('Dire Chocolate Shake')).not.toBeInTheDocument();
  });

  it('sorts products by price ascending', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('Radiant Fries')).toBeInTheDocument();
    });

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'price-asc' } });

    const cards = screen.getAllByRole('article');
    const names = cards.map((card) => card.querySelector('h3')?.textContent ?? '');
    expect(names).toEqual([
      'Radiant Fries',
      'Dire Chocolate Shake',
      'Classic Burger',
    ]);
  });

  it('sorts products by name ascending', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('Classic Burger')).toBeInTheDocument();
    });

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'name-asc' } });

    const cards = screen.getAllByRole('article');
    const names = cards.map((card) => card.querySelector('h3')?.textContent ?? '');
    expect(names[0]).toBe('Classic Burger');
    expect(names[1]).toBe('Dire Chocolate Shake');
    expect(names[2]).toBe('Radiant Fries');
  });

  it('shows empty state when no products match filter', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('Classic Burger')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar hamburguesas, acompañamientos...');
    fireEvent.change(searchInput, { target: { value: 'zzznotfound' } });

    expect(screen.getByText('No se encontraron productos')).toBeInTheDocument();
  });

  it('shows product price formatted correctly', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('$8.99')).toBeInTheDocument();
    });
    expect(screen.getByText('$4.49')).toBeInTheDocument();
    expect(screen.getByText('$5.99')).toBeInTheDocument();
  });

  it('shows error state when fetch fails and retry button', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Error al cargar productos')).toBeInTheDocument();
    });
    expect(screen.getByText('Reintentar')).toBeInTheDocument();
  });

  it('retries fetch on Reintentar click', async () => {
    // First call fails
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Error al cargar productos')).toBeInTheDocument();
    });

    // Second call succeeds
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(MOCK_API_PRODUCTS),
    });

    fireEvent.click(screen.getByText('Reintentar'));

    await waitFor(() => {
      expect(screen.getByText('Classic Burger')).toBeInTheDocument();
    });
  });
});
