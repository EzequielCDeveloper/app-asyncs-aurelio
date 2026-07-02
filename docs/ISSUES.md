# Issues Conocidos y Deuda Técnica

## Catálogo de Issues

| Issue | Severidad | Ubicación | Descripción |
|-------|-----------|-----------|-------------|
| "Cerrer" typo | Baja | TicketModal.jsx | El botón de cerrar decía "Cerrer" en lugar de "Cerrar". **Corregido.** |
| Login sin contraseña | Media | AuthContext.jsx, LoginPage.jsx | La autenticación usa DummyJSON sin password. Cualquier usuario existente puede loguearse solo con el username. |
| Sin tipos TypeScript | Media | Todos los archivos | El proyecto completo está en JSX sin type-checking. 93 tests en 10 archivos mitigan parcialmente el riesgo de regressions. |
| Sin configuración .env | Media | Raíz del proyecto | Las URLs de API (FakeStore, DummyJSON) y otros valores están hardcodeados. No hay variables de entorno. |
| Enlaces del Footer como placeholders | Baja | Footer.jsx | Todos los enlaces (Aviso de Privacidad, Términos, Contacto, Soporte) apuntan a `#`. |
| Stale cart migration | Baja | CartContext.jsx | Se introdujo `CART_VERSION=2`. Los carritos guardados con versión anterior se pierden al actualizar (se limpian silenciosamente). |
| validateInventory contra stock | Media | CheckoutPage.jsx, api.js | La validación de inventario compara `item.quantity > item.stock`, pero el stock proviene de FakeStore (`rating.count`) que no es un valor de inventario real. |

## Notas

- El typo **"Cerrer"** en TicketModal.jsx fue corregido a **"Cerrar"**. Se mantiene en este catálogo como referencia histórica únicamente.
- **Stale cart migration**: Con la introducción de `CART_VERSION=2`, los carritos almacenados con el formato anterior (array plano sin versionado) son descartados al cargar la página. Esto es intencional para evitar errores de schema al cambiar la estructura de datos.
- **validateInventory**: Revisa si `stock === 0` o `quantity > stock`. Dado que el stock proviene de FakeStore (`rating.count`), esta validación es ilustrativa — en una app real se validaría contra un backend de inventario.
