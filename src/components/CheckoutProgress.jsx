const STEPS = [
  { key: 1, label: "Conexión" },
  { key: 2, label: "Inventario" },
  { key: 3, label: "Total" },
  { key: 4, label: "Pedido" },
  { key: 5, label: "Pago" },
  { key: 6, label: "Guardar" },
  { key: 7, label: "Completado" },
];

export default function CheckoutProgress({ currentStep }) {
  const progressPercent = currentStep > 1
    ? Math.min(((currentStep - 1) / (STEPS.length - 1)) * 100, 100)
    : 0;

  return (
    <div className="relative mb-12">
      {/* Track line */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-border-subtle -translate-y-1/2 z-0 rounded-full" />
      <div
        className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500 ease-in-out rounded-full"
        style={{ width: `${progressPercent}%` }}
      />

      {/* Steps */}
      <div className="flex justify-between relative z-10">
        {STEPS.map((step) => {
          const isCompleted = currentStep > step.key;
          const isActive = currentStep === step.key;
          const isPending = currentStep < step.key;

          return (
            <div key={step.key} className="flex flex-col items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary"
                    : isActive
                    ? "bg-surface-container-lowest border-2 border-primary"
                    : "bg-surface-container-lowest border-2 border-border-subtle opacity-50"
                }`}
              >
                {isCompleted ? (
                  <span
                    className="material-symbols-outlined text-on-primary text-sm fill"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check
                  </span>
                ) : isActive ? (
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                ) : (
                  <span className="font-label-bold text-label-bold text-on-surface-variant">
                    {step.key}
                  </span>
                )}
              </div>
              <span
                className={`font-label-bold text-label-bold hidden md:block transition-colors ${
                  isCompleted || isActive
                    ? "text-primary"
                    : "text-on-surface-variant opacity-50"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
