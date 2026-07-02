# Design Tokens

Todos los tokens están definidos en el bloque `@theme` de `src/index.css` y están disponibles como clases utilitarias de Tailwind.

## Colores

### Brand Colors

| Token | CSS Variable | Hex | Uso |
|-------|-------------|-----|-----|
| Cream | `--color-brand-cream` | `#fbf8f3` | Color de fondo global (`body`) |
| Red | `--color-brand-red` | `#b90e0a` | Color primario base (también `--color-primary-container`) |
| Yellow | `--color-brand-yellow` | `#f1b80c` | Acento secundario |
| Dark | `--color-brand-dark` | `#1a1a1a` | Fondos oscuros |

### Surface Palette

| Token | CSS Variable | Hex | Uso |
|-------|-------------|-----|-----|
| surface | `--color-surface` | `#fcf9f8` | Superficie base |
| surface-dim | `--color-surface-dim` | `#dcd9d9` | Superficie atenuada |
| surface-bright | `--color-surface-bright` | `#fcf9f8` | Superficie brillante |
| surface-container-lowest | `--color-surface-container-lowest` | `#ffffff` | Cards, modales, dropdowns |
| surface-container-low | `--color-surface-container-low` | `#f6f3f2` | Fondos de input, contenedores secundarios |
| surface-container | `--color-surface-container` | `#f0eded` | Contenedores terciarios |
| surface-container-high | `--color-surface-container-high` | `#eae7e7` | Botones ghost, hover states |
| surface-container-highest | `--color-surface-container-highest` | `#e5e2e1` | Bordes de contenedores elevados |
| on-surface | `--color-on-surface` | `#1c1b1b` | Texto sobre superficies claras |
| on-surface-variant | `--color-on-surface-variant` | `#5c403b` | Texto secundario, etiquetas |
| inverse-surface | `--color-inverse-surface` | `#313030` | Superficie inversa (dark mode) |
| inverse-on-surface | `--color-inverse-on-surface` | `#f3f0ef` | Texto sobre superficie inversa |
| outline | `--color-outline` | `#916f6a` | Bordes, íconos secundarios |
| outline-variant | `--color-outline-variant` | `#e5bdb7` | Bordes sutiles |
| surface-tint | `--color-surface-tint` | `#bd120d` | Tinte de superficie (Material) |
| surface-variant | `--color-surface-variant` | `#e5e2e1` | Variante de superficie |

### Primary Palette

| Token | CSS Variable | Hex |
|-------|-------------|-----|
| primary | `--color-primary` | `#8f0002` |
| on-primary | `--color-on-primary` | `#ffffff` |
| primary-container | `--color-primary-container` | `#b90e0a` |
| on-primary-container | `--color-on-primary-container` | `#ffc8bf` |
| inverse-primary | `--color-inverse-primary` | `#ffb4a9` |
| primary-fixed | `--color-primary-fixed` | `#ffdad5` |
| primary-fixed-dim | `--color-primary-fixed-dim` | `#ffb4a9` |
| on-primary-fixed | `--color-on-primary-fixed` | `#410000` |
| on-primary-fixed-variant | `--color-on-primary-fixed-variant` | `#930002` |

**Uso**: `primary` es el color principal para botones CTA, encabezados importantes y acentos. `primary-container` se usa para hover states de botones primarios y badges.

### Secondary Palette

| Token | CSS Variable | Hex |
|-------|-------------|-----|
| secondary | `--color-secondary` | `#785a00` |
| on-secondary | `--color-on-secondary` | `#ffffff` |
| secondary-container | `--color-secondary-container` | `#fec320` |
| on-secondary-container | `--color-on-secondary-container` | `#6e5200` |
| secondary-fixed | `--color-secondary-fixed` | `#ffdf9b` |
| secondary-fixed-dim | `--color-secondary-fixed-dim` | `#f8be18` |
| on-secondary-fixed | `--color-on-secondary-fixed` | `#251a00` |
| on-secondary-fixed-variant | `--color-on-secondary-fixed-variant` | `#5b4300` |

**Uso**: `secondary-container` se usa para badges de productos, botones de combo y acentos amarillos.

### Tertiary Palette

| Token | CSS Variable | Hex |
|-------|-------------|-----|
| tertiary | `--color-tertiary` | `#003aa6` |
| on-tertiary | `--color-on-tertiary` | `#ffffff` |
| tertiary-container | `--color-tertiary-container` | `#004fd9` |
| on-tertiary-container | `--color-on-tertiary-container` | `#c8d3ff` |
| tertiary-fixed | `--color-tertiary-fixed` | `#dbe1ff` |
| tertiary-fixed-dim | `--color-tertiary-fixed-dim` | `#b5c4ff` |
| on-tertiary-fixed | `--color-on-tertiary-fixed` | `#00174c` |
| on-tertiary-fixed-variant | `--color-on-tertiary-fixed-variant` | `#003dab` |

**Uso**: `tertiary` se usa para acentos azules. Actualmente subutilizado en la app.

### Semantic Colors

| Token | CSS Variable | Hex | Uso |
|-------|-------------|-----|-----|
| error | `--color-error` | `#dc2626` | Errores de formulario, mensajes de error |
| on-error | `--color-on-error` | `#ffffff` | Texto sobre fondo de error |
| error-container | `--color-error-container` | `#ffdad6` | Fondo de mensajes de error |
| on-error-container | `--color-on-error-container` | `#93000a` | Texto sobre contenedor de error |
| success | `--color-success` | `#16a34a` | Badge de descuento, mensajes de éxito |
| background | `--color-background` | `#fcf9f8` | Fondo general de la app |
| on-background | `--color-on-background` | `#1c1b1b` | Texto sobre background |
| border-subtle | `--color-border-subtle` | `#e5e1da` | Bordes de tarjetas, inputs, separadores |

## Tipografía

| Token | Tamaño | Peso | Font | Uso |
|-------|--------|------|------|-----|
| headline-2xl | 48px | 800 (Extrabold) | Hanken Grotesk | Page titles (Hero) |
| headline-xl | 32px | 800 (Extrabold) | Hanken Grotesk | Section headers |
| headline-lg | 24px | 700 (Bold) | Hanken Grotesk | Card titles |
| headline-lg-mobile | 20px | 700 (Bold) | Hanken Grotesk | Card titles (mobile) |
| body-lg | 18px | 500 (Medium) | Hanken Grotesk | Lead text, subtítulos |
| body-base | 16px | 400 (Normal) | Hanken Grotesk | Body text general |
| price-display | 24px | 700 (Bold) | Hanken Grotesk | Precios |
| label-bold | 14px | 700 (Bold) | Hanken Grotesk | Labels, botones |

Todas las tipografías usan Hanken Grotesk con fallback a `sans-serif`. Cargado desde Google Fonts en `index.html`.

## Espaciado

| Token | Valor | Uso |
|-------|-------|-----|
| `container-max` | 1280px | Ancho máximo del contenido |
| `gutter-mobile` | 1rem | Padding horizontal en mobile |
| `gutter-desktop` | 2rem | Padding horizontal en desktop |
| `stack-sm` | 0.5rem | Espaciado pequeño (8px) |
| `stack-md` | 1rem | Espaciado medio (16px) |
| `stack-lg` | 2rem | Espaciado grande (32px) |

## Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-lg` | 0.5rem | Inputs, badges |
| `radius-xl` | 0.75rem | Contenedores medianos |
| `radius-2xl` | 1rem | Cards, modales, botones principales |
