import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchProducts,
  searchUser,
  submitOrder,
  validateConnection,
  validateInventory,
  savePurchase,
  getPurchases,
} from "../api";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("fetchProducts", () => {
  it("returns parsed JSON on success", async () => {
    const products = [{ id: 1, title: "Test" }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(products),
    });

    const result = await fetchProducts();
    expect(result).toEqual(products);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://fakestoreapi.com/products"
    );
  });

  it("throws on non-ok response", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false });

    await expect(fetchProducts()).rejects.toThrow("Error al cargar productos");
  });

  it("throws on network error", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(fetchProducts()).rejects.toThrow("Network error");
  });
});

describe("searchUser", () => {
  const mockUsersResponse = {
    users: [
      { id: 1, username: "emilys", firstName: "Emily" },
      { id: 2, username: "johnd", firstName: "John" },
    ],
  };

  it("returns user data on exact username match", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUsersResponse),
    });

    const result = await searchUser("emilys");
    expect(result).toEqual({
      id: 1,
      username: "emilys",
      firstName: "Emily",
      lastName: undefined,
      email: undefined,
      image: undefined,
    });
  });

  it("is case-insensitive when matching username", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUsersResponse),
    });

    const result = await searchUser("EMILYS");
    expect(result.id).toBe(1);
  });

  it("throws when username is not found", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUsersResponse),
    });

    await expect(searchUser("nonexistent")).rejects.toThrow(
      "Usuario no encontrado"
    );
  });

  it("throws on fetch failure", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false });

    await expect(searchUser("emilys")).rejects.toThrow(
      "Error de conexión al buscar usuario"
    );
  });
});

describe("submitOrder", () => {
  const userId = 1;
  const products = [
    { id: 1, quantity: 2 },
    { id: 3, quantity: 1 },
  ];

  it("posts to /carts/add and returns response", async () => {
    const response = { id: 42, userId: 1 };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(response),
    });

    const result = await submitOrder(userId, products);
    expect(result).toEqual(response);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://dummyjson.com/carts/add",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          products: products.map((p) => ({ id: p.id, quantity: p.quantity })),
        }),
      })
    );
  });

  it("throws on failure", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false });

    await expect(submitOrder(userId, products)).rejects.toThrow(
      "Error al guardar el pedido"
    );
  });
});

describe("validateConnection", () => {
  it("resolves when fetch succeeds", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });

    await expect(validateConnection()).resolves.toBeUndefined();
    expect(global.fetch).toHaveBeenCalledWith("https://dummyjson.com");
  });

  it("throws when fetch fails", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false });

    await expect(validateConnection()).rejects.toThrow(
      "Error de conexión con el servidor"
    );
  });
});

describe("validateInventory", () => {
  it("passes when all items have sufficient stock", () => {
    const items = [
      { name: "Burger", stock: 10, quantity: 2 },
      { name: "Fries", stock: 5, quantity: 1 },
    ];
    expect(() => validateInventory(items)).not.toThrow();
  });

  it("throws when an item has zero stock", () => {
    const items = [{ name: "Burger", stock: 0, quantity: 1 }];
    expect(() => validateInventory(items)).toThrow(
      "Producto Burger no tiene stock disponible"
    );
  });

  it("throws when quantity exceeds stock", () => {
    const items = [
      { name: "Burger", stock: 3, quantity: 10 },
    ];
    expect(() => validateInventory(items)).toThrow(
      "Producto Burger supera el stock disponible (pedido: 10, disponible: 3)"
    );
  });

  it("throws on first item that fails (multiple items)", () => {
    const items = [
      { name: "Fries", stock: 5, quantity: 1 },
      { name: "Burger", stock: 2, quantity: 5 },
      { name: "Shake", stock: 1, quantity: 1 },
    ];
    // Should throw on Burger (second item) because it's the first with quantity > stock
    // Actually it checks stock === 0 first, then quantity > stock
    // Fries passes (5 >= 1), Burger fails (2 < 5)
    expect(() => validateInventory(items)).toThrow("Burger");
  });
});

describe("savePurchase / getPurchases", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("appends order to purchases array in localStorage", () => {
    const order1 = { id: 42, total: 25.99 };
    savePurchase(order1);

    const stored = JSON.parse(localStorage.getItem("dotaburgers-purchases"));
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(42);
    expect(stored[0].total).toBe(25.99);
    expect(stored[0].date).toBeDefined();
  });

  it("appends multiple orders", () => {
    savePurchase({ id: 1 });
    savePurchase({ id: 2 });

    const stored = JSON.parse(localStorage.getItem("dotaburgers-purchases"));
    expect(stored).toHaveLength(2);
    expect(stored[0].id).toBe(1);
    expect(stored[1].id).toBe(2);
  });

  it("getPurchases returns purchases array", () => {
    localStorage.setItem("dotaburgers-purchases", JSON.stringify([{ id: 42 }]));
    expect(getPurchases()).toEqual([{ id: 42 }]);
  });

  it("getPurchases returns empty array when nothing saved", () => {
    expect(getPurchases()).toEqual([]);
  });

  it("getPurchases returns empty array on corrupted data", () => {
    localStorage.setItem("dotaburgers-purchases", "not-json");
    expect(getPurchases()).toEqual([]);
  });
});
