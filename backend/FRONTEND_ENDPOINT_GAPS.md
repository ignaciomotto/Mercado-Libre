# Integración frontend-backend

El frontend fue conectado a las rutas disponibles bajo `/api`. Estos puntos no
pueden representarse completamente con los contratos actuales del backend:

- `GET /api/users/{user_id}` y `GET /api/whoami` no devuelven
  `cantidad_calificaciones`; el frontend usa `0` hasta que exista ese campo o
  una ruta de estadísticas.
- `GET /api/listings/{listing_id}` y las respuestas de listado no devuelven
  `fecha_creacion`; el frontend no puede mostrar la fecha real y usa la fecha
  de recepción como fallback.
- `GET /api/categories/{category_id}/top-listings` devuelve un resumen (`listing_id`,
  `title`, `price`, `category_id`, `units_sold`), pero no una publicación completa
  ni el vendedor. La pantalla de ranking solo puede mostrar ese resumen.
- `GET /api/users/sellers/top` devuelve vendedores planos y no incluye
  `registration_date` ni `cantidad_calificaciones`; esos campos quedan vacíos o
  en cero en el modelo de presentación.
- `GET /api/users/{user_id}/purchases` devuelve el vendedor y datos básicos de la
  publicación, pero no `stock`, `status` de la publicación ni su categoría. El
  historial usa valores de presentación para esos campos.
- Las preguntas devuelven `author_id`, pero no el nombre del autor. El detalle
  muestra el identificador del usuario hasta que exista una respuesta expandida
  o el frontend haga una carga adicional por pregunta.

También hay una diferencia de contrato importante: el registro devuelve un
usuario, pero el login solo devuelve `{ "message": ... }`. El frontend resuelve
esto llamando inmediatamente a `GET /api/whoami`, usando la cookie
`session_token` que establece el login.

El login del backend declara `email` y `password` como parámetros simples de
FastAPI, por lo que el frontend los envía como query string (`POST /api/login?...`)
y no como JSON.

No se encontró una ruta backend para obtener calificaciones de un usuario ni
para completar una compra desde el frontend. El backend sí expone
`PUT /api/purchases/{purchase_id}/complete`, pero actualmente no hay una acción
equivalente en la UI.