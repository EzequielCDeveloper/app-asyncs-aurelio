import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { dispatch } = useCart();
  const starRating = product.rating != null ? Math.round(product.rating) : 0;

  return (
    <article className="bg-surface rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col border border-border-subtle group hover:-translate-y-1">
      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 bg-surface-container-low">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={product.image}
          alt={product.alt}
          loading="lazy"
        />
        {product.badge && (
          <span className="absolute top-2 left-2 bg-secondary-container text-on-secondary-container text-xs font-bold px-2 py-1 rounded-lg">
            {product.badge}
          </span>
        )}
      </div>

      {/* Category tag */}
      {product.category && (
        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-surface-container-low text-on-surface-variant mb-2 inline-block self-start">
          {product.category}
        </span>
      )}

      <h3 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface mb-1 line-clamp-1">
        {product.name}
      </h3>

      {/* Star rating */}
      {product.rating != null && (
        <div className="flex items-center gap-1 mb-2">
          <span className="text-amber-500 text-sm">
            {"★".repeat(starRating)}
            {"☆".repeat(5 - starRating)}
          </span>
          <span className="text-xs text-on-surface-variant">
            ({product.rating})
          </span>
        </div>
      )}

      <p className="text-body-base font-body-base text-on-surface-variant line-clamp-2 mb-4 flex-1">
        {product.description}
      </p>

      <div className="flex justify-between items-end mt-auto">
        <div className="flex flex-col">
          <span className="text-price-display font-price-display text-on-surface">
            ${product.price.toFixed(2)}
          </span>
          {product.stock != null && (
            <span
              className={`text-xs font-bold mt-1 ${
                product.stock > 0
                  ? "text-on-surface-variant"
                  : "text-error"
              }`}
            >
              {product.stock > 0 ? `Quedan ${product.stock}` : "Agotado"}
            </span>
          )}
        </div>
        <button
          onClick={() => dispatch({ type: "ADD_ITEM", product })}
          aria-label={`Agregar ${product.name} al carrito`}
          className="bg-primary hover:bg-primary-container text-on-primary w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
    </article>
  );
}
