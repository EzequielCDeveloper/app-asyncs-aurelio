import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  function shakeInput() {
    if (inputRef.current) {
      inputRef.current.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-5px)" },
          { transform: "translateX(5px)" },
          { transform: "translateX(-5px)" },
          { transform: "translateX(5px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 400, iterations: 1, easing: "ease-in-out" }
      );
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError("");

    try {
      await login(username.trim());
      navigate("/checkout");
    } catch (err) {
      setError(err.message);
      shakeInput();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-brand-cream text-on-surface min-h-screen flex flex-col items-center justify-center font-body-base antialiased px-gutter-mobile md:px-gutter-desktop">
      {/* Simplified Header */}
      <header className="absolute top-0 w-full flex justify-center py-stack-lg z-10">
        <div
          onClick={() => navigate("/")}
          className="font-headline-2xl text-headline-2xl font-extrabold text-primary tracking-tighter cursor-pointer"
        >
          DotaBURGUERS
        </div>
      </header>

      <main className="w-full max-w-md relative z-20">
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-border-subtle p-stack-lg flex flex-col gap-stack-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none -z-10" />

          <div className="text-center">
            <h1 className="font-headline-xl text-headline-xl text-on-surface mb-stack-sm">
              Bienvenido
            </h1>
            <p className="font-body-base text-body-base text-on-surface-variant">
              Ingresa tu usuario para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
              <div className="flex flex-col gap-stack-sm relative">
              <label className="sr-only" htmlFor="username">
                Usuario
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant z-10 pointer-events-none">
                  person
                </span>
                <input
                  ref={inputRef}
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Tu usuario"
                  disabled={loading}
                  className={`w-full bg-surface-container-lowest border rounded-2xl py-4 pl-12 pr-4 font-body-base text-body-base transition-colors focus:ring-2 focus:outline-none ${
                    error
                      ? "border-error focus:border-error focus:ring-error text-error"
                      : "border-border-subtle focus:border-primary focus:ring-primary text-on-surface placeholder:text-outline"
                  }`}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-error font-body-base text-sm mt-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary font-headline-lg-mobile text-headline-lg-mobile rounded-2xl py-4 flex items-center justify-center gap-2 transition-all hover:bg-primary-container hover:shadow-md active:scale-[0.98] focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-lowest outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">sync</span>
              ) : (
                <>
                  <span>Ingresar</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-20">
        <div className="absolute -top-1/4 -right-1/4 w-3/4 h-3/4 bg-primary-fixed-dim/20 rounded-full blur-[120px] mix-blend-multiply" />
        <div className="absolute -bottom-1/4 -left-1/4 w-2/3 h-2/3 bg-secondary-fixed/20 rounded-full blur-[100px] mix-blend-multiply" />
      </div>
    </div>
  );
}
