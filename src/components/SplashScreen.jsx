import { useState, useEffect } from "react";

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState("entered");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("exiting");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== "exiting") return;
    const timer = setTimeout(() => {
      setPhase("exited");
      onFinish?.();
    }, 700);
    return () => clearTimeout(timer);
  }, [phase, onFinish]);

  if (phase === "exited") return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-dark transition-opacity duration-700 ${
        phase === "exiting" ? "opacity-0" : "opacity-100"
      }`}
    >
      <h1 className="text-5xl md:text-7xl font-black text-brand-yellow tracking-tight mb-6">
        DotaBURGUERS
      </h1>
      <p className="text-brand-cream text-body-lg font-body-lg animate-pulse">
        Cargando...
      </p>
    </div>
  );
}
