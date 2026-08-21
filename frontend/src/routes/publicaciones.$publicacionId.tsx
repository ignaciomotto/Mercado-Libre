import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircleQuestion, Star } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import {
  comprar,
  crearPregunta,
  formatearFecha,
  formatearPrecio,
  getPreguntas,
  getPublicacion,
  getUsuario,
  responderPregunta,
} from "@/lib/api";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/publicaciones/$publicacionId")({
  head: () => ({
    meta: [
      { title: "Detalle de publicación — Feria" },
      { name: "description", content: "Mirá el precio, el stock, las preguntas respondidas y comprá directamente al vendedor." },
      { property: "og:title", content: "Detalle de publicación — Feria" },
      { property: "og:description", content: "Precio, stock, preguntas y compra directa en Feria." },
    ],
  }),
  component: Detalle,
});

function Detalle() {
  const { publicacionId } = Route.useParams();
  const id = Number(publicacionId);
  const { usuario } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [cantidad, setCantidad] = useState(1);
  const [texto, setTexto] = useState("");
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const { data: publicacion } = useQuery({
    queryKey: ["publicacion", id],
    queryFn: () => getPublicacion(id),
  });
  const { data: preguntas = [] } = useQuery({
    queryKey: ["preguntas", id],
    queryFn: () => getPreguntas(id),
  });
  const { data: vendedor } = useQuery({
    queryKey: ["usuario", publicacion?.vendedor_id],
    queryFn: () => getUsuario(publicacion!.vendedor_id),
    enabled: !!publicacion,
  });

  const refrescar = () => {
    queryClient.invalidateQueries({ queryKey: ["publicacion", id] });
    queryClient.invalidateQueries({ queryKey: ["preguntas", id] });
  };

  const comprarMut = useMutation({
    mutationFn: () => comprar(id, usuario!.id, cantidad),
    onSuccess: () => {
      refrescar();
      navigate({ to: "/compras" });
    },
    onError: (e: Error) => setMensaje({ tipo: "error", texto: e.message }),
  });

  const preguntarMut = useMutation({
    mutationFn: () => crearPregunta(id, usuario!.id, texto),
    onSuccess: () => {
      setTexto("");
      setMensaje({ tipo: "ok", texto: "Pregunta enviada." });
      refrescar();
    },
    onError: (e: Error) => setMensaje({ tipo: "error", texto: e.message }),
  });

  const responderMut = useMutation({
    mutationFn: ({ preguntaId, valor }: { preguntaId: number; valor: string }) =>
      responderPregunta(preguntaId, usuario!.id, valor),
    onSuccess: () => {
      setRespuestas({});
      refrescar();
    },
    onError: (e: Error) => setMensaje({ tipo: "error", texto: e.message }),
  });

  if (!publicacion) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-6xl px-4 py-20 text-center text-muted-foreground">
          Cargando publicación…
        </div>
      </AppLayout>
    );
  }

  const esVendedor = usuario?.id === publicacion.vendedor_id;

  return (
    <AppLayout>
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <nav className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Categoría #{publicacion.categoria_id}
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold">{publicacion.titulo}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
            <span
              className={
                publicacion.estado === "activa"
                  ? "rounded-full bg-success/15 px-2 py-0.5 font-semibold text-success"
                  : "rounded-full bg-warning/20 px-2 py-0.5 font-semibold text-warning-foreground"
              }
            >
              {publicacion.estado}
            </span>
            <span>Publicada el {formatearFecha(publicacion.fecha_creacion)}</span>
          </div>
          <p className="mt-6 text-base leading-relaxed">{publicacion.descripcion}</p>

          <section className="mt-10">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <MessageCircleQuestion className="size-5 text-accent" />
              Preguntas ({preguntas.length})
            </h2>

            {usuario && !esVendedor && (
              <form
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  preguntarMut.mutate();
                }}
              >
                <input
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  required
                  placeholder="Escribí tu pregunta al vendedor…"
                  className="field focus:field-focus"
                />
                <button className="btn-base btn-ink hover:brightness-110" type="submit">
                  Preguntar
                </button>
              </form>
            )}
            {esVendedor && (
              <p className="mt-3 text-sm text-muted-foreground">
                Sos el vendedor: podés responder, pero no preguntar en tu propia publicación.
              </p>
            )}
            {!usuario && (
              <p className="mt-3 text-sm text-muted-foreground">
                <Link to="/login" className="font-semibold text-accent hover:underline">
                  Iniciá sesión
                </Link>{" "}
                para preguntar.
              </p>
            )}

            <ul className="mt-6 space-y-4">
              {preguntas.map((p) => (
                <li key={p.id} className="surface p-4">
                  <p className="text-sm font-semibold">{p.texto}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.autor_nombre ?? `Usuario #${p.usuario_id}`} · {formatearFecha(p.fecha)}
                  </p>
                  {p.respuesta ? (
                    <div className="mt-3 rounded-lg border-l-4 border-primary bg-secondary/60 p-3">
                      <p className="text-sm">{p.respuesta.texto}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Respuesta del vendedor · {formatearFecha(p.respuesta.fecha)}
                      </p>
                    </div>
                  ) : esVendedor ? (
                    <form
                      className="mt-3 flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        responderMut.mutate({ preguntaId: p.id, valor: respuestas[p.id] ?? "" });
                      }}
                    >
                      <input
                        value={respuestas[p.id] ?? ""}
                        onChange={(e) => setRespuestas((r) => ({ ...r, [p.id]: e.target.value }))}
                        required
                        placeholder="Responder…"
                        className="field focus:field-focus"
                      />
                      <button className="btn-base btn-primary hover:brightness-105" type="submit">
                        Responder
                      </button>
                    </form>
                  ) : (
                    <p className="mt-3 text-xs italic text-muted-foreground">Sin responder todavía.</p>
                  )}
                </li>
              ))}
              {preguntas.length === 0 && (
                <li className="text-sm text-muted-foreground">Todavía no hay preguntas.</li>
              )}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface p-6">
            <p className="text-4xl font-extrabold">{formatearPrecio(publicacion.precio)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {publicacion.stock > 0 ? `${publicacion.stock} disponibles` : "Sin stock"}
            </p>

            <div className="mt-5 flex items-center gap-3">
              <label htmlFor="cantidad" className="text-sm font-semibold">
                Cantidad
              </label>
              <input
                id="cantidad"
                type="number"
                min={1}
                max={Math.max(publicacion.stock, 1)}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                className="field focus:field-focus w-24"
              />
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              Total: <strong className="text-foreground">{formatearPrecio(publicacion.precio * cantidad)}</strong>
            </p>

            {usuario ? (
              <button
                onClick={() => comprarMut.mutate()}
                disabled={esVendedor || publicacion.stock === 0 || comprarMut.isPending}
                className="btn-base btn-primary mt-5 w-full hover:brightness-105 disabled:opacity-50"
              >
                {esVendedor ? "Es tu publicación" : "Comprar ahora"}
              </button>
            ) : (
              <Link to="/login" className="btn-base btn-primary mt-5 w-full hover:brightness-105">
                Iniciá sesión para comprar
              </Link>
            )}

            {mensaje && (
              <p
                className={`mt-3 rounded-lg px-3 py-2 text-sm ${
                  mensaje.tipo === "error"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-success/15 text-success"
                }`}
              >
                {mensaje.texto}
              </p>
            )}
          </div>

          {vendedor && (
            <Link
              to="/usuarios/$usuarioId"
              params={{ usuarioId: String(vendedor.id) }}
              className="surface mt-4 flex items-center gap-3 p-4 transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <span className="grid size-10 place-items-center rounded-full bg-ink font-bold text-ink-foreground">
                {vendedor.nombre.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-semibold">{vendedor.nombre}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="size-3" />
                  {vendedor.reputacion != null ? `${vendedor.reputacion.toFixed(1)} de reputación` : "Sin reputación aún"}
                </p>
              </div>
            </Link>
          )}
        </aside>
      </div>
    </AppLayout>
  );
}
