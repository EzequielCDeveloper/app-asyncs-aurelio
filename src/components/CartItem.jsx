import { useCart } from "../context/CartContext";

export default function CartItem({ item }) {
  const { dispatch } = useCart();

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-border-subtle p-4 flex flex-col sm:flex-row gap-4 items-center group hover:shadow-md transition-shadow duration-200">
      <img
        className="w-full sm:w-32 h-32 rounded-xl object-cover bg-surface-container flex-shrink-0"
        src={item.image}
        alt={item.alt || item.name}
      />

      <div className="flex-grow flex flex-col w-full">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-headline-lg text-headline-lg text-on-background">
            {item.name}
          </h3>
          <button
            onClick={() => dispatch({ type: "REMOVE_ITEM", id: item.id })}
            aria-label={`Eliminar ${item.name}`}
            className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full focus:ring-2 focus:ring-primary outline-none"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>

        <p className="font-body-base text-body-base text-on-surface-variant mb-4 line-clamp-2">
          {item.description}
        </p>

        <div className="flex justify-between items-end mt-auto">
          <div className="flex items-center gap-2 bg-surface-container-low rounded-full p-1 border border-border-subtle">
            <button
              onClick={() => dispatch({ type: "DECREMENT", id: item.id })}
              aria-label="Disminuir cantidad"
              className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-background focus:ring-2 focus:ring-primary outline-none transition-colors"
            >
              <span className="material-symbols-outlined text-sm">remove</span>
            </button>
            <span className="font-label-bold text-label-bold w-4 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => dispatch({ type: "INCREMENT", id: item.id })}
              aria-label="Aumentar cantidad"
              className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-background focus:ring-2 focus:ring-primary outline-none transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add</span>
            </button>
          </div>
          <span className="font-price-display text-price-display text-on-background">
            ${(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
