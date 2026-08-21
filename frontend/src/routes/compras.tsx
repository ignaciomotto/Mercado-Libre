import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import {
  calificar,
  cancelarCompra,
  completarCompra,
  formatearFecha,
  formatearPrecio,
  getComprasDeUsuario,
  type EstadoCompra,
} from "@/lib/api";
import { useSession } from "@/lib/session";

const ESTADOS: (EstadoCompra | "todas")[] = ["todas", "pendiente", "finalizada", "cancelada"];

export const Route = createFileRoute("/compras")({
  head: () => ({
    meta: [
      { title: "Mis compras — Feria" },
      { name: "description", content: "Historial completo de tus compras ordenado por fecha, con filtros por estado, cancelación y calificación." },
      { property: "og:title", content: "Mis compras — Feria" },
      { property: "og:description", content: "Revisá, cancelá y calificá tus compras en Feria." },
    ],
  }),
  component: Compras,
});

function Compras() {
  const { usuario } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [estado, setEstado] = useState<EstadoCompra | "todas">("todas");
  const [mensaje, setMensaje] = useState<string | null>(null);

  const { data: compras = [] } = useQuery({
    queryKey: ["compras", usuario?.id, estado],
    queryFn: () => getComprasDeUsuario(usuario!.id, estado === "todas" ? undefined : estado),
    enabled: !!usuario,
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["compras"] });

  const cancelarMut = useMutation({
    mutationFn: (id: number) => cancelarCompra(id),
    onSuccess: () => {
      setMensaje("Compra cancelada. El stock volvió a la publicación.");
      invalidar();
    },
    onError: (e: Error) => setMensaje(e.message),
  });

  const calificarMut = useMutation({
    mutationFn: ({ compraId, puntaje }: { compraId: number; puntaje: number }) =>
      calificar(compraId, usuario!.id, puntaje),
    onSuccess: () => {
      setMensaje("¡Gracias! La reputación se recalculó automáticamente.");
      invalidar();
    },
    onError: (e: Error) => setMensaje(e.message),
  });

  const completarMut = useMutation({
    mutationFn: (id: number) => completarCompra(id),
    onSuccess: () => {
      setMensaje("Compra marcada como finalizada.");
      invalidar();
    },
    onError: (e: Error) => setMensaje(e.message),
  });

  if (!usuario) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="text-2xl font-extrabold">Iniciá sesión</h1>
          <p className="mt-2 text-sm text-muted-foreground">Para ver tu historial de compras.</p>
          <button onClick={() => navigate({ to: "/login" })} className="btn-base btn-ink mt-6 hover:brightness-110">
            Iniciar sesión
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-extrabold">Mis compras</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ordenadas por fecha descendente.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {ESTADOS.map((e) => (
            <button
              key={e}
              onClick={() => setEstado(e)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                estado === e ? "border-transparent bg-ink text-ink-foreground" : "border-border hover:bg-secondary"
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        {mensaje && (
          <p className="mt-4 rounded-lg bg-secondary px-3 py-2 text-sm">{mensaje}</p>
        )}

        <ul className="mt-6 space-y-4">
          {compras.map((c) => (
            <li key={c.id} className="surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to="/publicaciones/$publicacionId"
                    params={{ publicacionId: String(c.publicacion.id) }}
                    className="font-display text-lg font-bold hover:underline"
                  >
                    {c.publicacion.titulo}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Vendedor:{" "}
                    <Link
                      to="/usuarios/$usuarioId"
                      params={{ usuarioId: String(c.vendedor.id) }}
                      className="font-medium text-accent hover:underline"
                    >
                      {c.vendedor.nombre}
                    </Link>{" "}
                    · {formatearFecha(c.fecha)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {c.cantidad} unidad(es) · Total{" "}
                    <strong className="text-foreground">{formatearPrecio(c.total)}</strong>
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold capitalize">
                  {c.estado}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {c.estado === "pendiente" && (
                  <>
                    <button onClick={() => cancelarMut.mutate(c.id)} className="btn-base btn-outline hover:bg-secondary">
                      Cancelar compra
                    </button>
                    <button onClick={() => completarMut.mutate(c.id)} className="btn-base btn-primary hover:brightness-105">
                      Finalizar compra
                    </button>
                  </>
                )}
                {c.estado === "finalizada" && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Calificar al vendedor:</span>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => calificarMut.mutate({ compraId: c.id, puntaje: n })}
                        className="size-8 rounded-lg border border-border text-sm font-bold hover:bg-primary hover:text-primary-foreground"
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
          {compras.length === 0 && (
            <li className="surface p-12 text-center text-sm text-muted-foreground">
              No hay compras con este filtro.
            </li>
          )}
        </ul>
      </div>
    </AppLayout>
  );
}
