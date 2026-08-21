/**
 * Capa de datos del frontend.
 *
 * TODOS los endpoints del backend están declarados aquí y COMENTADOS.
 * Reemplazá el cuerpo de cada función por el fetch correspondiente cuando
 * conectes la API real. La firma de cada función ya es la definitiva.
 *
 * const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
 */

// ---------------------------------------------------------------------------
// Tipos del dominio
// ---------------------------------------------------------------------------

export type EstadoPublicacion = "activa" | "pausada" | "finalizada";
export type EstadoCompra = "pendiente" | "enviada" | "finalizada" | "cancelada";

export interface Usuario {
  id: number;
  nombre: string;
  email: string; // único (HU1)
  /** HU8: promedio de calificaciones recibidas, null con menos de 3 calificaciones */
  reputacion: number | null;
  cantidad_calificaciones: number;
  fecha_registro: string; // ISO, automático (HU1)
}

export interface Categoria {
  id: number;
  nombre: string;
  categoria_padre_id: number | null; // null => raíz (HU2)
}

export interface CategoriaNodo extends Categoria {
  hijas: CategoriaNodo[];
}

export interface Publicacion {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number; // > 0 (HU3)
  stock: number; // > 0 al crear (HU3)
  estado: EstadoPublicacion;
  vendedor_id: number;
  categoria_id: number; // debe ser hoja (HU3)
  fecha_creacion: string;
  imagen?: string | undefined;
}

export interface Pregunta {
  id: number;
  publicacion_id: number;
  usuario_id: number; // no puede ser el vendedor (HU4)
  texto: string;
  fecha: string;
  respuesta: Respuesta | null; // máximo una (HU4)
}

export interface Respuesta {
  id: number;
  pregunta_id: number;
  texto: string;
  fecha: string;
}

export interface Compra {
  id: number;
  publicacion_id: number;
  comprador_id: number;
  cantidad: number;
  total: number; // precio * cantidad (HU5)
  estado: EstadoCompra; // arranca en "pendiente"
  fecha: string;
}

export interface CompraDetallada extends Compra {
  publicacion: Publicacion;
  vendedor: Usuario;
}

export interface Calificacion {
  id: number;
  compra_id: number;
  de_usuario_id: number;
  para_usuario_id: number;
  puntaje: number; // 1..5 (HU7)
  comentario?: string | undefined;
  fecha: string;
}

export interface VendedorTop {
  usuario: Usuario;
  ventas_finalizadas: number;
}

export interface PublicacionVendida {
  publicacion: Publicacion;
  unidades_vendidas: number;
}

export interface FiltrosBusqueda {
  q?: string;
  categoria?: number;
  precio_min?: number;
  precio_max?: number;
}

// ---------------------------------------------------------------------------
// Datos mock en memoria (se reemplazan por la API)
// ---------------------------------------------------------------------------

const hoy = new Date();
const iso = (diasAtras: number) =>
  new Date(hoy.getTime() - diasAtras * 86400000).toISOString();

export const db = {
  usuarios: [
    { id: 1, nombre: "Lucía Fernández", email: "lucia@mail.com", reputacion: 4.7, cantidad_calificaciones: 12, fecha_registro: iso(320) },
    { id: 2, nombre: "Martín Rossi", email: "martin@mail.com", reputacion: 4.9, cantidad_calificaciones: 31, fecha_registro: iso(410) },
    { id: 3, nombre: "Sofía Duarte", email: "sofia@mail.com", reputacion: 4.2, cantidad_calificaciones: 8, fecha_registro: iso(180) },
    { id: 4, nombre: "Nicolás Vega", email: "nico@mail.com", reputacion: null, cantidad_calificaciones: 2, fecha_registro: iso(40) },
    { id: 5, nombre: "Camila Ortiz", email: "camila@mail.com", reputacion: 4.5, cantidad_calificaciones: 19, fecha_registro: iso(260) },
    { id: 6, nombre: "Diego Sosa", email: "diego@mail.com", reputacion: 3.8, cantidad_calificaciones: 6, fecha_registro: iso(95) },
  ] as Usuario[],

  categorias: [
    { id: 1, nombre: "Tecnología", categoria_padre_id: null },
    { id: 2, nombre: "Computación", categoria_padre_id: 1 },
    { id: 3, nombre: "Notebooks", categoria_padre_id: 2 },
    { id: 4, nombre: "Monitores", categoria_padre_id: 2 },
    { id: 5, nombre: "Celulares", categoria_padre_id: 1 },
    { id: 6, nombre: "Smartphones", categoria_padre_id: 5 },
    { id: 7, nombre: "Accesorios de celular", categoria_padre_id: 5 },
    { id: 8, nombre: "Hogar", categoria_padre_id: null },
    { id: 9, nombre: "Cocina", categoria_padre_id: 8 },
    { id: 10, nombre: "Cafeteras", categoria_padre_id: 9 },
    { id: 11, nombre: "Muebles", categoria_padre_id: 8 },
    { id: 12, nombre: "Deportes", categoria_padre_id: null },
    { id: 13, nombre: "Ciclismo", categoria_padre_id: 12 },
    { id: 14, nombre: "Running", categoria_padre_id: 12 },
  ] as Categoria[],

  publicaciones: [
    { id: 1, titulo: "Notebook Lenovo IdeaPad 15\" i5", descripcion: "16GB RAM, SSD 512GB. Usada, impecable.", precio: 850000, stock: 3, estado: "activa", vendedor_id: 2, categoria_id: 3, fecha_creacion: iso(12) },
    { id: 2, titulo: "Monitor 27\" IPS 144Hz", descripcion: "Ideal para gaming y diseño. Caja original.", precio: 320000, stock: 5, estado: "activa", vendedor_id: 2, categoria_id: 4, fecha_creacion: iso(9) },
    { id: 3, titulo: "iPhone 13 128GB", descripcion: "Batería 92%. Libre de fábrica.", precio: 1100000, stock: 1, estado: "activa", vendedor_id: 1, categoria_id: 6, fecha_creacion: iso(6) },
    { id: 4, titulo: "Funda de silicona premium", descripcion: "Varios colores disponibles.", precio: 12000, stock: 40, estado: "activa", vendedor_id: 5, categoria_id: 7, fecha_creacion: iso(20) },
    { id: 5, titulo: "Cafetera express Oster", descripcion: "20 bares, vaporizador incluido.", precio: 210000, stock: 0, estado: "pausada", vendedor_id: 5, categoria_id: 10, fecha_creacion: iso(31) },
    { id: 6, titulo: "Escritorio de roble macizo", descripcion: "140x70cm, cajonera incluida.", precio: 480000, stock: 2, estado: "activa", vendedor_id: 3, categoria_id: 11, fecha_creacion: iso(4) },
    { id: 7, titulo: "Bicicleta gravel talle M", descripcion: "Cuadro aluminio, grupo Shimano GRX.", precio: 1450000, stock: 1, estado: "activa", vendedor_id: 6, categoria_id: 13, fecha_creacion: iso(2) },
    { id: 8, titulo: "Zapatillas running Adidas", descripcion: "Talle 42. Nuevas con etiqueta.", precio: 145000, stock: 7, estado: "activa", vendedor_id: 6, categoria_id: 14, fecha_creacion: iso(15) },
  ] as Publicacion[],

  preguntas: [
    { id: 1, publicacion_id: 1, usuario_id: 3, texto: "¿Hacés envío a Córdoba?", fecha: iso(5), respuesta: { id: 1, pregunta_id: 1, texto: "Sí, por correo con seguimiento.", fecha: iso(5) } },
    { id: 2, publicacion_id: 1, usuario_id: 4, texto: "¿Tiene garantía?", fecha: iso(3), respuesta: null },
    { id: 3, publicacion_id: 3, usuario_id: 6, texto: "¿Aceptás permuta?", fecha: iso(2), respuesta: null },
  ] as Pregunta[],

  compras: [
    { id: 1, publicacion_id: 2, comprador_id: 1, cantidad: 1, total: 320000, estado: "finalizada", fecha: iso(30) },
    { id: 2, publicacion_id: 4, comprador_id: 1, cantidad: 2, total: 24000, estado: "pendiente", fecha: iso(3) },
    { id: 3, publicacion_id: 8, comprador_id: 3, cantidad: 1, total: 145000, estado: "enviada", fecha: iso(6) },
    { id: 4, publicacion_id: 1, comprador_id: 5, cantidad: 1, total: 850000, estado: "finalizada", fecha: iso(45) },
    { id: 5, publicacion_id: 6, comprador_id: 1, cantidad: 1, total: 480000, estado: "cancelada", fecha: iso(12) },
  ] as Compra[],

  calificaciones: [] as Calificacion[],
};

const nextId = (arr: { id: number }[]) => (arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 1);
const wait = <T,>(value: T, ms = 220): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const getUsuarioSync = (id: number) => db.usuarios.find((u) => u.id === id);
export const getCategoriaSync = (id: number) => db.categorias.find((c) => c.id === id);
export const esHoja = (id: number) => !db.categorias.some((c) => c.categoria_padre_id === id);

/** Devuelve el id de la categoría y todos sus descendientes (HU12). */
export function idsDescendientes(id: number): number[] {
  const acc = [id];
  for (const hija of db.categorias.filter((c) => c.categoria_padre_id === id)) {
    acc.push(...idsDescendientes(hija.id));
  }
  return acc;
}

export function rutaCategoria(id: number): Categoria[] {
  const ruta: Categoria[] = [];
  let actual = getCategoriaSync(id);
  while (actual) {
    ruta.unshift(actual);
    actual = actual.categoria_padre_id ? getCategoriaSync(actual.categoria_padre_id) : undefined;
  }
  return ruta;
}

/** HU8: promedio de calificaciones recibidas; null si tiene menos de 3. */
export function recalcularReputacion(usuarioId: number) {
  const usuario = getUsuarioSync(usuarioId);
  if (!usuario) return;
  const recibidas = db.calificaciones.filter((c) => c.para_usuario_id === usuarioId);
  const total = usuario.cantidad_calificaciones + recibidas.length;
  if (total < 3) {
    usuario.reputacion = null;
    return;
  }
  const base = (usuario.reputacion ?? 0) * usuario.cantidad_calificaciones;
  const suma = base + recibidas.reduce((acc, c) => acc + c.puntaje, 0);
  usuario.reputacion = Number((suma / total).toFixed(2));
}

// ---------------------------------------------------------------------------
// HU1 — Registro / autenticación
// ---------------------------------------------------------------------------

export interface RegistroInput {
  nombre: string;
  email: string;
  password: string;
}

export async function registrarUsuario(input: RegistroInput): Promise<Usuario> {
  // POST /usuarios
  // const res = await fetch(`${API_URL}/usuarios`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(input),
  // });
  // if (!res.ok) throw new Error((await res.json()).mensaje ?? "No se pudo registrar");
  // return res.json();

  if (db.usuarios.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("Ya existe una cuenta con ese email.");
  }
  const usuario: Usuario = {
    id: nextId(db.usuarios),
    nombre: input.nombre,
    email: input.email,
    reputacion: null, // HU1: reputación inicia en 0 / sin calificaciones
    cantidad_calificaciones: 0,
    fecha_registro: new Date().toISOString(), // automático
  };
  db.usuarios.push(usuario);
  return wait(usuario);
}

export async function iniciarSesion(email: string, _password: string): Promise<Usuario> {
  // POST /auth/login
  // const res = await fetch(`${API_URL}/auth/login`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ email, password }),
  // });
  // if (!res.ok) throw new Error("Email o contraseña inválidos");
  // return res.json();

  const usuario = db.usuarios.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!usuario) throw new Error("Email o contraseña inválidos.");
  return wait(usuario);
}

// ---------------------------------------------------------------------------
// HU2 — Categorías jerárquicas
// ---------------------------------------------------------------------------

export async function getArbolCategorias(): Promise<CategoriaNodo[]> {
  // GET /categorias/arbol
  // return (await fetch(`${API_URL}/categorias/arbol`)).json();

  const construir = (padre: number | null): CategoriaNodo[] =>
    db.categorias
      .filter((c) => c.categoria_padre_id === padre)
      .map((c) => ({ ...c, hijas: construir(c.id) }));
  return wait(construir(null));
}

export async function crearCategoria(nombre: string, padreId: number | null): Promise<Categoria> {
  // POST /categorias  { nombre, categoria_padre_id }
  // Validación de ciclos en backend: una categoría no puede ser descendiente de sí misma.
  const categoria: Categoria = { id: nextId(db.categorias), nombre, categoria_padre_id: padreId };
  db.categorias.push(categoria);
  return wait(categoria);
}

// ---------------------------------------------------------------------------
// HU3 / HU9 — Publicaciones
// ---------------------------------------------------------------------------

export interface PublicacionInput {
  titulo: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria_id: number;
  vendedor_id: number;
}

export async function crearPublicacion(input: PublicacionInput): Promise<Publicacion> {
  // POST /publicaciones
  if (input.precio <= 0) throw new Error("El precio debe ser mayor a 0.");
  if (input.stock <= 0) throw new Error("El stock debe ser mayor a 0.");
  if (!esHoja(input.categoria_id)) throw new Error("La categoría debe ser hoja (sin subcategorías).");

  const publicacion: Publicacion = {
    id: nextId(db.publicaciones),
    ...input,
    estado: "activa", // HU3
    fecha_creacion: new Date().toISOString(),
  };
  db.publicaciones.push(publicacion);
  return wait(publicacion);
}

export async function buscarPublicaciones(filtros: FiltrosBusqueda): Promise<Publicacion[]> {
  // GET /publicaciones?q=texto&categoria=X&precio_min=&precio_max=
  // const params = new URLSearchParams();
  // if (filtros.q) params.set("q", filtros.q);
  // if (filtros.categoria) params.set("categoria", String(filtros.categoria));
  // if (filtros.precio_min != null) params.set("precio_min", String(filtros.precio_min));
  // if (filtros.precio_max != null) params.set("precio_max", String(filtros.precio_max));
  // return (await fetch(`${API_URL}/publicaciones?${params}`)).json();

  const q = filtros.q?.trim().toLowerCase() ?? "";
  const cats = filtros.categoria ? idsDescendientes(filtros.categoria) : null;
  const resultado = db.publicaciones.filter((p) => {
    if (p.estado !== "activa") return false; // HU9: solo activas
    if (q && !`${p.titulo} ${p.descripcion}`.toLowerCase().includes(q)) return false;
    if (cats && !cats.includes(p.categoria_id)) return false;
    if (filtros.precio_min != null && p.precio < filtros.precio_min) return false;
    if (filtros.precio_max != null && p.precio > filtros.precio_max) return false;
    return true;
  });
  return wait(resultado);
}

export async function getPublicacion(id: number): Promise<Publicacion | undefined> {
  // GET /publicaciones/{id}
  return wait(db.publicaciones.find((p) => p.id === id));
}

export async function getPublicacionesDeUsuario(usuarioId: number): Promise<Publicacion[]> {
  // GET /usuarios/{id}/publicaciones
  return wait(db.publicaciones.filter((p) => p.vendedor_id === usuarioId));
}

// ---------------------------------------------------------------------------
// HU4 — Preguntas y respuestas
// ---------------------------------------------------------------------------

export async function getPreguntas(publicacionId: number): Promise<Pregunta[]> {
  // GET /publicaciones/{id}/preguntas  (ordenadas por fecha)
  const lista = db.preguntas
    .filter((p) => p.publicacion_id === publicacionId)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  return wait(lista);
}

export async function crearPregunta(
  publicacionId: number,
  usuarioId: number,
  texto: string,
): Promise<Pregunta> {
  // POST /publicaciones/{id}/preguntas
  const publicacion = db.publicaciones.find((p) => p.id === publicacionId);
  if (!publicacion) throw new Error("La publicación no existe.");
  if (publicacion.vendedor_id === usuarioId) throw new Error("El vendedor no puede preguntar en su propia publicación.");

  const pregunta: Pregunta = {
    id: nextId(db.preguntas),
    publicacion_id: publicacionId,
    usuario_id: usuarioId,
    texto,
    fecha: new Date().toISOString(),
    respuesta: null,
  };
  db.preguntas.push(pregunta);
  return wait(pregunta);
}

export async function responderPregunta(
  preguntaId: number,
  usuarioId: number,
  texto: string,
): Promise<Pregunta> {
  // POST /preguntas/{id}/respuesta
  const pregunta = db.preguntas.find((p) => p.id === preguntaId);
  if (!pregunta) throw new Error("La pregunta no existe.");
  const publicacion = db.publicaciones.find((p) => p.id === pregunta.publicacion_id);
  if (publicacion?.vendedor_id !== usuarioId) throw new Error("Solo el vendedor puede responder.");
  if (pregunta.respuesta) throw new Error("La pregunta ya tiene respuesta.");

  pregunta.respuesta = {
    id: nextId(db.preguntas.flatMap((p) => (p.respuesta ? [p.respuesta] : []))),
    pregunta_id: preguntaId,
    texto,
    fecha: new Date().toISOString(),
  };
  return wait(pregunta);
}

// ---------------------------------------------------------------------------
// HU5 / HU6 / HU10 — Compras
// ---------------------------------------------------------------------------

export async function comprar(
  publicacionId: number,
  compradorId: number,
  cantidad: number,
): Promise<Compra> {
  // POST /compras  { publicacion_id, cantidad }
  const publicacion = db.publicaciones.find((p) => p.id === publicacionId);
  if (!publicacion) throw new Error("La publicación no existe.");
  if (publicacion.vendedor_id === compradorId) throw new Error("No podés comprar tu propia publicación.");
  if (cantidad <= 0) throw new Error("La cantidad debe ser mayor a 0.");
  if (cantidad > publicacion.stock) throw new Error("La cantidad supera el stock disponible.");

  publicacion.stock -= cantidad;
  if (publicacion.stock === 0) publicacion.estado = "pausada"; // HU5

  const compra: Compra = {
    id: nextId(db.compras),
    publicacion_id: publicacionId,
    comprador_id: compradorId,
    cantidad,
    total: publicacion.precio * cantidad,
    estado: "pendiente",
    fecha: new Date().toISOString(),
  };
  db.compras.push(compra);
  return wait(compra);
}

export async function cancelarCompra(compraId: number): Promise<Compra> {
  // POST /compras/{id}/cancelar
  const compra = db.compras.find((c) => c.id === compraId);
  if (!compra) throw new Error("La compra no existe.");
  if (compra.estado !== "pendiente") throw new Error("Solo se pueden cancelar compras pendientes.");

  const publicacion = db.publicaciones.find((p) => p.id === compra.publicacion_id);
  if (publicacion) {
    publicacion.stock += compra.cantidad; // HU6: devuelve stock
    if (publicacion.estado === "pausada" && publicacion.stock > 0) publicacion.estado = "activa";
  }
  compra.estado = "cancelada";
  return wait(compra);
}

export async function getComprasDeUsuario(
  usuarioId: number,
  estado?: EstadoCompra,
): Promise<CompraDetallada[]> {
  // GET /usuarios/{id}/compras?estado=
  const lista = db.compras
    .filter((c) => c.comprador_id === usuarioId && (!estado || c.estado === estado))
    .sort((a, b) => b.fecha.localeCompare(a.fecha)) // fecha descendente
    .map((c) => {
      const publicacion = db.publicaciones.find((p) => p.id === c.publicacion_id)!;
      return { ...c, publicacion, vendedor: getUsuarioSync(publicacion.vendedor_id)! };
    });
  return wait(lista);
}

// ---------------------------------------------------------------------------
// HU7 — Calificaciones
// ---------------------------------------------------------------------------

export async function calificar(
  compraId: number,
  deUsuarioId: number,
  puntaje: number,
  comentario?: string,
): Promise<Calificacion> {
  // POST /compras/{id}/calificaciones  { puntaje, comentario }
  const compra = db.compras.find((c) => c.id === compraId);
  if (!compra) throw new Error("La compra no existe.");
  if (compra.estado !== "finalizada") throw new Error("Solo se puede calificar una compra finalizada.");
  if (puntaje < 1 || puntaje > 5) throw new Error("El puntaje debe estar entre 1 y 5.");

  const publicacion = db.publicaciones.find((p) => p.id === compra.publicacion_id)!;
  const esComprador = compra.comprador_id === deUsuarioId;
  const esVendedor = publicacion.vendedor_id === deUsuarioId;
  if (!esComprador && !esVendedor) throw new Error("No participaste de esta compra.");
  if (db.calificaciones.some((c) => c.compra_id === compraId && c.de_usuario_id === deUsuarioId)) {
    throw new Error("Ya calificaste esta compra.");
  }

  const calificacion: Calificacion = {
    id: nextId(db.calificaciones),
    compra_id: compraId,
    de_usuario_id: deUsuarioId,
    para_usuario_id: esComprador ? publicacion.vendedor_id : compra.comprador_id,
    puntaje,
    comentario,
    fecha: new Date().toISOString(),
  };
  db.calificaciones.push(calificacion);
  recalcularReputacion(calificacion.para_usuario_id); // HU8
  return wait(calificacion);
}

// ---------------------------------------------------------------------------
// HU8 — Perfil con reputación
// ---------------------------------------------------------------------------

export async function getUsuario(id: number): Promise<Usuario | undefined> {
  // GET /usuarios/{id}  (incluye reputación calculada)
  return wait(getUsuarioSync(id));
}

// ---------------------------------------------------------------------------
// HU11 — Top vendedores
// ---------------------------------------------------------------------------

export async function getTopVendedores(): Promise<VendedorTop[]> {
  // GET /vendedores/top
  const ventasPorVendedor = new Map<number, number>();
  for (const compra of db.compras) {
    if (compra.estado !== "finalizada") continue;
    const publicacion = db.publicaciones.find((p) => p.id === compra.publicacion_id);
    if (!publicacion) continue;
    ventasPorVendedor.set(
      publicacion.vendedor_id,
      (ventasPorVendedor.get(publicacion.vendedor_id) ?? 0) + 1,
    );
  }
  // Mock: aseguramos volumen para ilustrar el mínimo de 5 ventas finalizadas.
  const refuerzo: Record<number, number> = { 1: 9, 2: 24, 3: 7, 5: 14, 6: 5, 4: 2 };
  const lista = db.usuarios
    .map((usuario) => ({
      usuario,
      ventas_finalizadas: (ventasPorVendedor.get(usuario.id) ?? 0) + (refuerzo[usuario.id] ?? 0),
    }))
    .filter((v) => v.ventas_finalizadas >= 5 && v.usuario.reputacion != null)
    .sort(
      (a, b) =>
        (b.usuario.reputacion ?? 0) - (a.usuario.reputacion ?? 0) ||
        b.ventas_finalizadas - a.ventas_finalizadas,
    )
    .slice(0, 10);
  return wait(lista);
}

// ---------------------------------------------------------------------------
// HU12 — Top publicaciones por categoría
// ---------------------------------------------------------------------------

export async function getTopPublicacionesCategoria(categoriaId: number): Promise<PublicacionVendida[]> {
  // GET /categorias/{id}/top-publicaciones
  const cats = idsDescendientes(categoriaId);
  const unidades = new Map<number, number>();
  for (const compra of db.compras) {
    if (compra.estado !== "finalizada") continue;
    const publicacion = db.publicaciones.find((p) => p.id === compra.publicacion_id);
    if (!publicacion || !cats.includes(publicacion.categoria_id)) continue;
    unidades.set(publicacion.id, (unidades.get(publicacion.id) ?? 0) + compra.cantidad);
  }
  const lista = db.publicaciones
    .filter((p) => cats.includes(p.categoria_id))
    .map((publicacion) => ({
      publicacion,
      unidades_vendidas: unidades.get(publicacion.id) ?? 0,
    }))
    .sort((a, b) => b.unidades_vendidas - a.unidades_vendidas)
    .slice(0, 5);
  return wait(lista);
}

// ---------------------------------------------------------------------------
// Utilidades de presentación
// ---------------------------------------------------------------------------

export const formatearPrecio = (valor: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(valor);

export const formatearFecha = (iso: string) =>
  new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
