export default function Footer() {
  return (
    <footer className="w-full py-stack-lg px-gutter-mobile md:px-gutter-desktop flex flex-col md:flex-row justify-between items-center gap-stack-md bg-surface-container-low border-t border-border-subtle mt-auto">
      <div className="font-headline-lg text-headline-lg font-black text-primary">
        DotaBURGUERS
      </div>
      <nav className="flex flex-wrap justify-center gap-4 md:gap-8">
        <span className="font-body-base text-body-base text-on-surface-variant transition-colors">
          Aviso de Privacidad
        </span>
        <span className="font-body-base text-body-base text-on-surface-variant transition-colors">
          Términos del Servicio
        </span>
        <span className="font-body-base text-body-base text-on-surface-variant transition-colors">
          Contacto
        </span>
        <span className="font-body-base text-body-base text-on-surface-variant transition-colors">
          Soporte
        </span>
      </nav>
      <div className="font-body-base text-body-base text-on-surface-variant">
        &copy; 2024 DotaBURGUERS. Todos los derechos reservados.
      </div>
    </footer>
  );
}
