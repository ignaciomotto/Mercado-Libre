# Integración frontend-backend: cerrada

La integración de endpoints está cerrada. El frontend consume las rutas reales
del backend bajo `/api`, incluyendo autenticación por cookie, publicaciones,
categorías, preguntas, compras, calificaciones, perfiles y rankings.

Se incorporaron los datos que necesitaba la UI: reputación y cantidad de
calificaciones, fecha de creación y datos completos de publicaciones, datos
completos del vendedor en compras, nombre del autor de preguntas, consulta de
calificaciones por usuario y finalización de compras desde la UI.

Para una base existente, ejecutar una vez la migración
`src/db/migrations/001_add_listing_created_at.sql`.

El login continúa usando `POST /api/login?email=...&password=...` porque el
router actual declara esas credenciales como parámetros de FastAPI. La sesión
se recupera luego con `GET /api/whoami`.