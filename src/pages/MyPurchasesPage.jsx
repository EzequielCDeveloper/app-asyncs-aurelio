import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { getPurchases } from "../api";

export default function MyPurchasesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setPurchases(getPurchases());
  }, [user, navigate]);

  function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <>
      <Header />

      <main className="flex-grow flex items-start justify-center py-stack-lg px-gutter-mobile md:px-gutter-desktop">
        <div className="w-full max-w-container-max md:max-w-3xl">
          <div className="mb-8">
            <h1 className="font-headline-xl text-headline-xl text-primary mb-2">
              Mis Compras
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Historial de pedidos realizados.
            </p>
          </div>

          {purchases.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-lowest rounded-xl border border-border-subtle shadow-sm">
              <span className="material-symbols-outlined text-secondary-container text-5xl mb-4 fill">
                receipt_long
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
                No tenés compras aún
              </h2>
              <p className="font-body-base text-body-base text-on-surface-variant mb-6">
                Tus pedidos aparecerán acá después de completar la compra.
              </p>
              <Link
                to="/"
                className="inline-block bg-primary text-on-primary px-6 py-3 rounded-2xl font-label-bold text-label-bold hover:bg-primary-container transition-colors shadow-sm no-underline"
              >
                Ver menú
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {[...purchases].reverse().map((order) => (
                <div
                  key={order.id + (order.date || "")}
                  className="bg-surface-container-lowest rounded-xl border border-border-subtle shadow-sm p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
                        Pedido #{order.id}
                      </h3>
                      <p className="text-sm text-on-surface-variant mt-1">
                        {formatDate(order.date)}
                      </p>
                    </div>
                    <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">
                      ${(order.total ?? 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t border-border-subtle pt-4">
                    <h4 className="font-label-bold text-label-bold text-on-surface mb-3 text-sm uppercase tracking-wider">
                      Productos
                    </h4>
                    <div className="space-y-2">
                      {(order.products || []).map((p, idx) => (
                        <div
                          key={p.id ?? idx}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-on-surface">
                            {p.title || `Producto #${p.id}`}
                          </span>
                          <span className="text-on-surface-variant">
                            x{p.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
