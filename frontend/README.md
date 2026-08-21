# Marketplace Hub

realiza el frontend en typeScrypt basandote en :HU1 — Registro de usuario

Como visitante, quiero registrarme para comprar y vender.

El email es único.

reputacion inicia en 0.

fecha_registro se guarda automáticamente.

HU2 — Categorías jerárquicas

Como administrador, quiero organizar categorías en árbol.

Una categoría puede tener una categoría padre (o ninguna, si es raíz).

GET /categorias/arbol devuelve la estructura anidada completa.

No puede existir un ciclo (una categoría no puede ser descendiente de sí misma).

HU3 — Publicar producto

Como vendedor, quiero publicar productos en venta.

precio y stock deben ser mayores a 0.

La publicación arranca en estado activa.

La categoría debe ser hoja (no puede tener subcategorías).

GET /usuarios/{id}/publicaciones devuelve las publicaciones del vendedor.

HU4 — Preguntas y respuestas

Como comprador, quiero preguntar antes de comprar.

Cualquiera puede preguntar salvo el propio vendedor.

Solo el vendedor de la publicación puede responder.

Cada pregunta tiene como máximo una respuesta.

GET /publicaciones/{id}/preguntas devuelve preguntas con su respuesta (si existe), ordenadas por fecha.

HU5 — Comprar producto

Como comprador, quiero comprar una publicación.

Un usuario no puede comprar su propia publicación.

La cantidad no puede superar el stock disponible.

Al confirmar la compra se descuenta el stock; si queda en 0, la publicación pasa a pausada.

total = precio * cantidad, la compra arranca en estado pendiente.

HU6 — Cancelar compra

Como comprador, quiero cancelar una compra que aún no fue enviada.

Solo se puede cancelar si el estado es pendiente.

Al cancelar, el stock se devuelve a la publicación.

Si la publicación estaba pausada por falta de stock, vuelve a activa.

HU7 — Calificación mutua

Como comprador o vendedor, quiero calificar a la otra parte al finalizar la compra.

Solo se puede calificar si la compra está en estado finalizada.

Cada compra permite una calificación del comprador al vendedor y una del vendedor al comprador.

puntaje entre 1 y 5.

HU8 — Reputación calculada

Como plataforma, quiero mostrar la reputación de cada usuario.

GET /usuarios/{id} incluye la reputación como promedio de calificaciones recibidas.

Si el usuario tiene menos de 3 calificaciones, la reputación se muestra como null.

La reputación se recalcula automáticamente al recibir una nueva calificación.

HU9 — Búsqueda con filtros

Como comprador, quiero buscar publicaciones por texto y filtros.

GET /publicaciones?q=texto&categoria=X&precio_min=&precio_max= filtra por título/descripción, categoría y precio.

Solo se listan publicaciones activas.

La búsqueda no distingue mayúsculas y minúsculas.

HU10 — Historial de compras

Como comprador, quiero ver mi historial.

GET /usuarios/{id}/compras devuelve todas las compras del usuario, ordenadas por fecha descendente.

Se puede filtrar por estado.

Incluye datos de la publicación y del vendedor.

HU11 — Top vendedores

Como comprador, quiero ver los mejores vendedores.

GET /vendedores/top devuelve los 10 usuarios con mayor reputación.

Solo se consideran vendedores con al menos 5 compras finalizadas.

Ordenados por reputación descendente; en empate, por cantidad de ventas.

HU12 — Publicaciones más vendidas por categoría

Como administrador, quiero saber qué se vende más en cada categoría.

GET /categorias/{id}/top-publicaciones devuelve las 5 publicaciones con más unidades vendidas en la categoría.

Solo cuentan compras finalizadas.

Incluye subcategorías descendientes.
deja los endpoints consumibles comentados que despues yo los modifico
por favor separa la pantalla de inicio de la pantalla de log in (inicio de sesion)

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7da75cff-6b7e-457c-acd9-5ee4d61e654c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
