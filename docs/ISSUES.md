# Issues Conocidos y Deuda Técnica

## Catálogo de Issues

| Issue | Severidad | Ubicación | Descripción |
|-------|-----------|-----------|-------------|
| "Cerrer" typo | Baja | TicketModal.jsx:118 | El botón de cerrar decía "Cerrer" en lugar de "Cerrar". **Corregido en este cambio.** |
| Login sin contraseña | Media | AuthContext.jsx, LoginPage.jsx | La autenticación usa DummyJSON sin password. Cualquier usuario existente puede loguearse solo con el username. |
| Sin tipos TypeScript | Media | Todos los archivos | El proyecto completo está en JSX sin type-checking. Props de componentes no tienen validación de tipos. |
| Sin tests | Alta | Todo el proyecto | No hay pruebas unitarias, de integración ni e2e. Cero cobertura. |
| Sin configuración .env | Media | Raíz del proyecto | Las URLs de API (DummyJSON) y otros valores están hardcodeados. No hay variables de entorno. |
| Botones decorativos "Add $14.99" / "Add $4.99" | Media | HomePage.jsx:158-160, 187-190 | Los botones de combo/smoothie son decorativos — no agregan items al carrito ni tienen funcionalidad real. |
| Enlaces del Footer como placeholders | Baja | Footer.jsx:8-19 | Todos los enlaces (Aviso de Privacidad, Términos, Contacto, Soporte) apuntan a `#`. |
| Order ID generado client-side | Alta (si fuera real) | CheckoutPage.jsx:59-61 | El ID de orden se genera en el cliente (`DB-${timestamp}-${random}`). Sin backend, no hay garantía de unicidad real. |
| URLs de imagen CDN muy largas | Baja | data/products.js | Las URLs de imágenes de productos son extremadamente largas (contenido AIDA public). |
| CartItem spread de todos los campos del producto | Baja | CartContext.jsx:25 | ADD_ITEM hace spread de `...action.product`, incluyendo campos que quizás no deberían persistir en el carrito (descripción, badge, etc.). |

## Notas

- El typo **"Cerrer"** en TicketModal.jsx:118 fue corregido a **"Cerrar"** como parte de este cambio de documentación. Se mantiene en este catálogo como referencia histórica únicamente.
