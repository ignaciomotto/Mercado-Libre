import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Star, Trophy } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { getTopVendedores } from "@/lib/api";

export const Route = createFileRoute("/vendedores/top")({
  head: () => ({
    meta: [
      { title: "Top vendedores — Bazar Libre" },
      { name: "description", content: "Los 10 vendedores con mayor reputación, con al menos 5 compras finalizadas." },
      { property: "og:title", content: "Top vendedores — Bazar Libre" },
      { property: "og:description", content: "Ranking de los mejores vendedores de Bazar Libre por reputación y ventas." },
    ],
  }),
  component: TopVendedores,
});

function TopVendedores() {
  const { data: top = [] } = useQuery({ queryKey: ["vendedores", "top"], queryFn: getTopVendedores });

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="flex items-center gap-2 text-3xl font-extrabold">
          <Trophy className="size-7 text-primary" />
          Top vendedores
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Los 10 con mayor reputación, con al menos 5 compras finalizadas. En caso de empate ordena
          la cantidad de ventas.
        </p>

        <ol className="mt-8 space-y-3">
          {top.map((v, i) => (
            <li key={v.usuario.id}>
              <Link
                to="/usuarios/$usuarioId"
                params={{ usuarioId: String(v.usuario.id) }}
                className="surface flex items-center gap-4 p-4 transition-shadow hover:shadow-[var(--shadow-lift)]"
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-full font-extrabold ${
                    i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{v.usuario.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {v.ventas_finalizadas} compras finalizadas
                  </p>
                </div>
                <span className="flex items-center gap-1 text-lg font-extrabold">
                  {v.usuario.reputacion?.toFixed(1)}
                  <Star className="size-4 fill-primary text-primary" />
                </span>
              </Link>
            </li>
          ))}
          {top.length === 0 && (
            <li className="surface p-12 text-center text-sm text-muted-foreground">
              Todavía no hay vendedores que cumplan el mínimo de 5 ventas finalizadas.
            </li>
          )}
        </ol>
      </div>
    </AppLayout>
  );
}
