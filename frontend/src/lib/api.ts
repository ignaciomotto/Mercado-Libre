/** Cliente HTTP del backend. Las rutas del backend se sirven bajo /api. */

const configuredApiUrl = Reflect.get(import.meta.env, "VITE_API_URL") as string | undefined;
const defaultApiOrigin = typeof window !== "undefined"
  ? `${window.location.protocol}//${window.location.hostname}:8000`
  : "http://localhost:8000";
const API_URL = (configuredApiUrl ?? `${defaultApiOrigin}/api`).replace(/\/+$/, "");
const API_ORIGIN = new URL(API_URL).origin;

export type EstadoPublicacion = "activa" | "pausada" | "finalizada";
export type EstadoCompra = "pendiente" | "enviada" | "finalizada" | "cancelada";

export interface Usuario { id: number; nombre: string; email: string; reputacion: number | null; cantidad_calificaciones: number; fecha_registro: string }
export interface Categoria { id: number; nombre: string; categoria_padre_id: number | null }
export interface CategoriaNodo extends Categoria { hijas: CategoriaNodo[] }
export interface Publicacion { id: number; titulo: string; descripcion: string; precio: number; stock: number; estado: EstadoPublicacion; vendedor_id: number; vendedor_nombre?: string | undefined; categoria_id: number; categoria_nombre?: string | undefined; fecha_creacion: string; imagen?: string | undefined }
export interface Respuesta { id: number; pregunta_id: number; texto: string; fecha: string }
export interface Pregunta { id: number; publicacion_id: number; usuario_id: number; autor_nombre?: string | undefined; texto: string; fecha: string; respuesta: Respuesta | null }
export interface Compra { id: number; publicacion_id: number; comprador_id: number; cantidad: number; total: number; estado: EstadoCompra; fecha: string }
export interface CompraDetallada extends Compra { publicacion: Publicacion; vendedor: Usuario }
export interface Calificacion { id: number; compra_id: number; de_usuario_id: number; para_usuario_id: number; puntaje: number; comentario?: string | undefined; fecha: string }
export interface VendedorTop { usuario: Usuario; ventas_finalizadas: number }
export interface PublicacionVendida { publicacion: Publicacion; unidades_vendidas: number }
export interface FiltrosBusqueda { q?: string; categoria?: number; precio_min?: number; precio_max?: number }
export interface RegistroInput { nombre: string; email: string; password: string }
export interface PublicacionInput { titulo: string; descripcion: string; precio: number; stock: number; categoria_id: number; vendedor_id: number; imagen?: File }
export interface PublicacionUpdateInput { titulo: string; descripcion: string; precio: number; stock: number; categoria_id: number; imagen?: File }

type BackendUser = { id: number; name: string; email: string; registration_date: string; reputation?: number | null; rating_count?: number };
type BackendListing = { id: number; seller_id: number; seller_name?: string | null; title: string; description: string; price: number; stock: number; category_id: number | null; category_name?: string | null; status: string; created_at?: string | null; image_url?: string | null };
type BackendQuestion = { id: number; listing_id: number; author_id: number; author_name?: string | null; text: string; date: string; answer?: { id: number; question_id: number; text: string; date: string } | null };
type BackendPurchaseHistory = { id: number; quantity: number; total_price: number; status: string; date: string; listing_id: number; listing_title: string; listing_description: string; listing_price: number; listing_stock: number; listing_category_id: number | null; listing_status: string; seller_id: number; seller_name: string; seller_email: string; seller_registration_date: string; seller_reputation: number | null; seller_rating_count: number };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;
  const providedHeaders = init?.headers;
  const headers: HeadersInit = isFormData ? (providedHeaders ?? {}) : { "Content-Type": "application/json", ...(providedHeaders ?? {}) };
  const requestInit: RequestInit = { credentials: "include", headers };
  if (init?.method) requestInit.method = init.method;
  if (init?.body) requestInit.body = init.body;
  if (init?.signal) requestInit.signal = init.signal;
  const requestUrl = `${API_URL}${path}`;
  let response: Response;
  try {
    response = await fetch(requestUrl, requestInit);
  } catch {
    throw new Error(`No se pudo conectar con el servidor (${init?.method ?? "GET"} ${path})`);
  }
  if (!response.ok) {
    let message = `Error ${response.status}`;
    try { const body = (await response.json()) as { detail?: string; message?: string }; message = body.detail ?? body.message ?? message; } catch { /* Backend may return an empty error response. */ }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

const mapUser = (user: BackendUser): Usuario => ({ id: user.id, nombre: user.name, email: user.email, reputacion: user.reputation ?? null, cantidad_calificaciones: user.rating_count ?? 0, fecha_registro: user.registration_date });
const mapStatus = <T extends string>(status: string): T => status.toLowerCase() as T;
const mapImageUrl = (imageUrl?: string | null) => imageUrl ? new URL(imageUrl, API_ORIGIN).toString() : undefined;
const mapListing = (listing: BackendListing): Publicacion => {
  const mapped: Publicacion = { id: listing.id, titulo: listing.title, descripcion: listing.description, precio: listing.price, stock: listing.stock, estado: mapStatus<EstadoPublicacion>(listing.status), vendedor_id: listing.seller_id, categoria_id: listing.category_id ?? 0, fecha_creacion: listing.created_at ?? new Date().toISOString() };
  if (listing.seller_name) mapped.vendedor_nombre = listing.seller_name;
  if (listing.category_name) mapped.categoria_nombre = listing.category_name;
  const image = mapImageUrl(listing.image_url);
  return image ? { ...mapped, imagen: image } : mapped;
};
const mapCategory = (category: { id: number; name: string; parent_id?: number | null }): Categoria => ({ id: category.id, nombre: category.name, categoria_padre_id: category.parent_id ?? null });
const mapQuestion = (question: BackendQuestion): Pregunta => {
  const mapped: Pregunta = { id: question.id, publicacion_id: question.listing_id, usuario_id: question.author_id, texto: question.text, fecha: question.date, respuesta: question.answer ? { id: question.answer.id, pregunta_id: question.answer.question_id, texto: question.answer.text, fecha: question.answer.date } : null };
  return question.author_name ? { ...mapped, autor_nombre: question.author_name } : mapped;
};
const mapPurchase = (purchase: { id: number; buyer_id: number; listing_id: number; quantity: number; total_price: number; status: string; date?: string }): Compra => ({ id: purchase.id, comprador_id: purchase.buyer_id, publicacion_id: purchase.listing_id, cantidad: purchase.quantity, total: purchase.total_price, estado: mapStatus<EstadoCompra>(purchase.status), fecha: purchase.date ?? new Date().toISOString() });

export async function registrarUsuario(input: RegistroInput): Promise<Usuario> {
  await request<BackendUser>("/users/", { method: "POST", body: JSON.stringify({ name: input.nombre, email: input.email, password: input.password }) });
  return iniciarSesion(input.email, input.password);
}
export async function iniciarSesion(email: string, password: string): Promise<Usuario> {
  const params = new URLSearchParams({ email, password });
  await request<{ message: string }>(`/login?${params}`, { method: "POST" });
  return getUsuarioActual();
}
export async function cerrarSesion(): Promise<void> { await request<void>("/logout", { method: "POST" }); }
export async function getUsuarioActual(): Promise<Usuario> { return mapUser(await request<BackendUser>("/whoami")); }

export async function getArbolCategorias(): Promise<CategoriaNodo[]> {
  type Node = { id: number; name: string; children: Node[] };
  const tree = await request<Node[]>("/categories/tree");
  const mapNode = (node: Node, parent: number | null): CategoriaNodo => ({ id: node.id, nombre: node.name, categoria_padre_id: parent, hijas: node.children.map((child) => mapNode(child, node.id)) });
  return tree.map((node) => mapNode(node, null));
}
export async function getCategorias(): Promise<Categoria[]> { return (await request<Array<{ id: number; name: string; parent_id?: number | null }>>("/categories/")).map(mapCategory); }
export async function crearCategoria(nombre: string, padreId: number | null): Promise<Categoria> { return mapCategory(await request("/categories/", { method: "POST", body: JSON.stringify({ name: nombre, parent_id: padreId }) })); }

export async function crearPublicacion(input: PublicacionInput): Promise<Publicacion> {
  const listing = mapListing(await request<BackendListing>("/listings/", { method: "POST", body: JSON.stringify({ seller_id: input.vendedor_id, title: input.titulo, description: input.descripcion, price: input.precio, stock: input.stock, category_id: input.categoria_id }) }));
  if (!input.imagen) return listing;
  const formData = new FormData();
  formData.append("image", input.imagen);
  return mapListing(await request<BackendListing>(`/listings/${listing.id}/image`, { method: "POST", body: formData }));
}
export async function actualizarPublicacion(id: number, input: PublicacionUpdateInput): Promise<Publicacion> {
  let listing = mapListing(await request<BackendListing>(`/listings/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title: input.titulo, description: input.descripcion, price: input.precio, stock: input.stock, category_id: input.categoria_id }),
  }));
  if (!input.imagen) return listing;
  const formData = new FormData();
  formData.append("image", input.imagen);
  listing = mapListing(await request<BackendListing>(`/listings/${id}/image`, { method: "POST", body: formData }));
  return listing;
}
export async function buscarPublicaciones(filtros: FiltrosBusqueda): Promise<Publicacion[]> {
  const params = new URLSearchParams();
  if (filtros.q) params.set("search", filtros.q);
  if (filtros.categoria) params.set("category_id", String(filtros.categoria));
  if (filtros.precio_min != null) params.set("min_price", String(filtros.precio_min));
  if (filtros.precio_max != null) params.set("max_price", String(filtros.precio_max));
  return (await request<BackendListing[]>(`/listings/search?${params}`)).map(mapListing);
}
export async function getPublicacion(id: number): Promise<Publicacion | undefined> { return mapListing(await request<BackendListing>(`/listings/${id}`)); }
export async function getPublicacionesDeUsuario(usuarioId: number): Promise<Publicacion[]> { return (await request<BackendListing[]>(`/users/${usuarioId}/publications`)).map(mapListing); }

export async function getPreguntas(publicacionId: number): Promise<Pregunta[]> { return (await request<BackendQuestion[]>(`/publications/${publicacionId}/questions`)).map(mapQuestion); }
export async function crearPregunta(publicacionId: number, usuarioId: number, texto: string): Promise<Pregunta> { return mapQuestion(await request<BackendQuestion>(`/publications/${publicacionId}/ask?author_id=${usuarioId}`, { method: "POST", body: JSON.stringify({ text: texto }) })); }
export async function responderPregunta(preguntaId: number, usuarioId: number, texto: string): Promise<Pregunta> { return mapQuestion(await request<BackendQuestion>(`/questions/${preguntaId}/answer?seller_id=${usuarioId}`, { method: "POST", body: JSON.stringify({ text: texto }) })); }

export async function comprar(publicacionId: number, compradorId: number, cantidad: number): Promise<Compra> { return mapPurchase(await request(`/purchases/?buyer_id=${compradorId}`, { method: "POST", body: JSON.stringify({ listing_id: publicacionId, quantity: cantidad }) })); }
export async function cancelarCompra(compraId: number): Promise<Compra> { return mapPurchase(await request(`/purchases/${compraId}/cancel`, { method: "PUT" })); }
export async function completarCompra(compraId: number): Promise<Compra> { return mapPurchase(await request(`/purchases/${compraId}/complete`, { method: "PUT" })); }
export async function getComprasDeUsuario(usuarioId: number, estado?: EstadoCompra): Promise<CompraDetallada[]> {
  const params = estado ? `?status=${encodeURIComponent(estado.charAt(0)!.toUpperCase() + estado.slice(1))}` : "";
  const purchases = await request<BackendPurchaseHistory[]>(`/users/${usuarioId}/purchases${params}`);
  return purchases.map((purchase) => ({ ...mapPurchase({ ...purchase, buyer_id: usuarioId, listing_id: purchase.listing_id }), publicacion: { id: purchase.listing_id, vendedor_id: purchase.seller_id, titulo: purchase.listing_title, descripcion: purchase.listing_description, precio: purchase.listing_price, stock: purchase.listing_stock, categoria_id: purchase.listing_category_id ?? 0, estado: mapStatus<EstadoPublicacion>(purchase.listing_status), fecha_creacion: purchase.date }, vendedor: { id: purchase.seller_id, nombre: purchase.seller_name, email: purchase.seller_email, reputacion: purchase.seller_reputation, cantidad_calificaciones: purchase.seller_rating_count, fecha_registro: purchase.seller_registration_date } }));
}

export async function calificar(compraId: number, deUsuarioId: number, puntaje: number, comentario?: string): Promise<Calificacion> {
  const rating = await request<{ id: number; purchase_id: number; rater_id: number; rated_id: number; score: number; comment?: string; date: string }>(`/ratings/purchases/${compraId}?rater_id=${deUsuarioId}`, { method: "POST", body: JSON.stringify({ score: puntaje, comment: comentario }) });
  const mapped: Calificacion = { id: rating.id, compra_id: rating.purchase_id, de_usuario_id: rating.rater_id, para_usuario_id: rating.rated_id, puntaje: rating.score, fecha: rating.date };
  return rating.comment ? { ...mapped, comentario: rating.comment } : mapped;
}
export async function getUsuario(id: number): Promise<Usuario | undefined> { return mapUser(await request<BackendUser>(`/users/${id}`)); }
export async function getCalificacionesUsuario(id: number): Promise<Calificacion[]> {
  const ratings = await request<Array<{ id: number; purchase_id: number; rater_id: number; rated_id: number; score: number; comment?: string; date: string }>>(`/users/${id}/ratings`);
  return ratings.map((rating) => {
    const mapped: Calificacion = { id: rating.id, compra_id: rating.purchase_id, de_usuario_id: rating.rater_id, para_usuario_id: rating.rated_id, puntaje: rating.score, fecha: rating.date };
    return rating.comment ? { ...mapped, comentario: rating.comment } : mapped;
  });
}
export async function getTopVendedores(): Promise<VendedorTop[]> {
  const sellers = await request<Array<{ id: number; name: string; email: string; reputation: number; completed_sales: number; registration_date: string; rating_count: number }>>("/users/sellers/top");
  return sellers.map((seller) => ({ usuario: { id: seller.id, nombre: seller.name, email: seller.email, reputacion: seller.reputation, cantidad_calificaciones: seller.rating_count, fecha_registro: seller.registration_date }, ventas_finalizadas: seller.completed_sales }));
}
export async function getTopPublicacionesCategoria(categoriaId: number): Promise<PublicacionVendida[]> {
  const listings = await request<Array<{ listing_id: number; title: string; description: string; price: number; stock: number; category_id: number; category_name?: string; seller_id: number; seller_name?: string; status: string; created_at?: string; image_url?: string; units_sold: number }>>(`/categories/${categoriaId}/top-listings`);
  return listings.map((listing) => {
    const publicacion: Publicacion = { id: listing.listing_id, titulo: listing.title, descripcion: listing.description, precio: listing.price, stock: listing.stock, estado: mapStatus<EstadoPublicacion>(listing.status), vendedor_id: listing.seller_id, vendedor_nombre: listing.seller_name, categoria_id: listing.category_id, categoria_nombre: listing.category_name, fecha_creacion: listing.created_at ?? new Date().toISOString() };
    const image = mapImageUrl(listing.image_url);
    return { publicacion: image ? { ...publicacion, imagen: image } : publicacion, unidades_vendidas: listing.units_sold };
  });
}

export const formatearPrecio = (valor: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(valor);
export const formatearFecha = (value: string) => new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
