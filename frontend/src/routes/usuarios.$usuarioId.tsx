import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Mail, Star } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PublicacionCard } from "@/components/PublicacionCard";
import { formatearFecha, getPublicacionesDeUsuario, getUsuario } from "@/lib/api";

export const Route = createFileRoute("/usuarios/$usuarioId")({
  head: () => ({
    meta: [
      { title: "Perfil de usuario — Feria" },
      { name: "description", content: "Reputación calculada, fecha de registro y publicaciones del vendedor en Feria." },
      { property: "og:title", content: "Perfil de usuario — Feria" },
      { property: "og:description", content: "Mirá la reputación y las publicaciones de este usuario." },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const { usuarioId } = Route.useParams();
  const id = Number(usuarioId);

  const { data: usuario } = useQuery({ queryKey: ["usuario", id], queryFn: () => getUsuario(id) });
  const { data: publicaciones = [] } = useQuery({
    queryKey: ["usuario", id, "publicaciones"],
    queryFn: () => getPublicacionesDeUsuario(id),
  });

  if (!usuario) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-4xl px-4 py-20 text-center text-muted-foreground">
          Cargando perfil…
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="surface flex flex-wrap items-center gap-6 p-6">
          <span className="grid size-20 place-items-center rounded-2xl bg-ink text-3xl font-extrabold text-ink-foreground">
            {usuario.nombre.charAt(0)}
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold">{usuario.nombre}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-4" /> {usuario.email}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="size-4" /> Miembro desde {formatearFecha(usuario.fecha_registro)}
            </p>
          </div>
          <div className="ml-auto rounded-2xl bg-secondary px-6 py-4 text-center">
            <p className="flex items-center justify-center gap-1 text-3xl font-extrabold">
              {usuario.reputacion != null ? (
                <>
                  {usuario.reputacion.toFixed(1)}
                  <Star className="size-5 fill-primary text-primary" />
                </>
              ) : (
                "—"
              )}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {usuario.reputacion != null
                ? `${usuario.cantidad_calificaciones} calificaciones`
                : "Menos de 3 calificaciones"}
            </p>
          </div>
        </div>

        <h2 className="mt-10 text-xl font-bold">Publicaciones ({publicaciones.length})</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {publicaciones.map((p) => (
            <PublicacionCard key={p.id} publicacion={p} />
          ))}
          {publicaciones.length === 0 && (
            <p className="text-sm text-muted-foreground">Este usuario todavía no publicó nada.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
