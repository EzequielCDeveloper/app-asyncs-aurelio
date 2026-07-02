const CATEGORY_MAP = {
  "electronics": "Burgers",
  "jewelery": "Sides",
  "men's clothing": "Drinks",
  "women's clothing": "Desserts",
};

export function mapCategory(fakeCategory) {
  return CATEGORY_MAP[fakeCategory] ?? fakeCategory;
}

export function normalizeProduct(raw) {
  return {
    id: raw.id,
    name: raw.title,
    price: raw.price,
    description: raw.description,
    category: mapCategory(raw.category),
    image: raw.image,
    rating: raw.rating?.rate ?? 0,
    stock: raw.rating?.count ?? 0,
    alt: raw.title,
    badge: null,
  };
}
