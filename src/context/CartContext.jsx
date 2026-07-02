import { createContext, useContext, useReducer, useEffect } from "react";
import { normalizeProduct } from "../utils";

const CartContext = createContext(null);
const CART_VERSION = 2;

export function loadCart() {
  try {
    const raw = localStorage.getItem("dotaburgers-cart");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Old format (plain array): backward compatible
    if (Array.isArray(parsed)) return parsed;
    // New format: { version, items }
    if (parsed.version !== CART_VERSION) return [];
    return parsed.items || [];
  } catch {
    return [];
  }
}

export function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      // Safety check: only normalize if product has `title` (raw API shape)
      const product = action.product.title
        ? normalizeProduct(action.product)
        : action.product;
      const existing = state.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= 99) return state;
        return state.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...state, { ...product, quantity: 1 }];
    }
    case "REMOVE_ITEM":
      return state.filter((item) => item.id !== action.id);
    case "INCREMENT": {
      const item = state.find((i) => i.id === action.id);
      if (!item) return state;
      if (item.quantity >= 99) return state;
      return state.map((i) =>
        i.id === action.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    }
    case "DECREMENT":
      return state
        .map((i) => (i.id === action.id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [], loadCart);

  useEffect(() => {
    localStorage.setItem(
      "dotaburgers-cart",
      JSON.stringify({ version: CART_VERSION, items })
    );
  }, [items]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = subtotal > 500 ? subtotal * 0.1 : 0;
  const iva = (subtotal - discount) * 0.16;
  const total = subtotal - discount + iva;

  const value = {
    items,
    totalItems,
    subtotal,
    discount,
    iva,
    total,
    dispatch,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
