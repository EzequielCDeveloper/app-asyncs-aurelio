export async function fetchProducts() {
  const res = await fetch("https://fakestoreapi.com/products");
  if (!res.ok) throw new Error("Error al cargar productos");
  return res.json();
}

export async function searchUser(username) {
  const res = await fetch("https://dummyjson.com/users");
  if (!res.ok) throw new Error("Error de conexión al buscar usuario");

  const data = await res.json();
  const found = data.users?.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );

  if (!found) throw new Error("Usuario no encontrado");

  return {
    id: found.id,
    username: found.username,
    firstName: found.firstName,
    lastName: found.lastName,
    email: found.email,
    image: found.image,
  };
}

export async function submitOrder(userId, products) {
  const res = await fetch("https://dummyjson.com/carts/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      products: products.map((p) => ({ id: p.id, quantity: p.quantity })),
    }),
  });
  if (!res.ok) throw new Error("Error al guardar el pedido");
  return res.json();
}

export async function validateConnection() {
  const res = await fetch("https://dummyjson.com");
  if (!res.ok) throw new Error("Error de conexión con el servidor");
}

export function validateInventory(items) {
  const outOfStock = items.filter((i) => i.stock === 0);
  if (outOfStock.length) {
    throw new Error(
      `Producto ${outOfStock[0].name} no tiene stock disponible`
    );
  }
}

export function savePurchase(order) {
  localStorage.setItem("dotaburgers-last-order", JSON.stringify(order));
}
