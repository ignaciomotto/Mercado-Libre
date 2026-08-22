import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SearchX } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PublicacionCard } from "@/components/PublicacionCard";
import { buscarPublicaciones, getCategorias, type FiltrosBusqueda } from "@/lib/api";

export const Route = createFileRoute("/publicaciones/")({
  head: () => ({
    meta: [
      { title: "Buscar publicaciones — Bazar Libre" },
      { name: "description", content: "Buscá publicaciones activas por texto, categoría y rango de precio en Bazar Libre." },
      { property: "og:title", content: "Buscar publicaciones — Bazar Libre" },
      { property: "og:description", content: "Filtrá por texto, categoría y precio entre todas las publicaciones activas." },
    ],
  }),
  component: Buscar,
});

function Buscar() {
  const [q, setQ] = useState("");
  const [categoria, setCategoria] = useState<string>("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");

  const filtros: FiltrosBusqueda = useMemo(
    () => ({
      q,
      ...(categoria ? { categoria: Number(categoria) } : {}),
      ...(precioMin ? { precio_min: Number(precioMin) } : {}),
      ...(precioMax ? { precio_max: Number(precioMax) } : {}),
    }),
    [q, categoria, precioMin, precioMax],
  );

  const { data: resultados = [], isFetching } = useQuery({
    queryKey: ["publicaciones", filtros],
    queryFn: () => buscarPublicaciones(filtros),
  });
  const { data: categorias = [] } = useQuery({ queryKey: ["categorias"], queryFn: getCategorias });

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-extrabold">Buscar publicaciones</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Solo se listan publicaciones activas. La búsqueda no distingue mayúsculas y minúsculas.
        </p>

        <div className="surface mt-6 grid gap-3 p-4 md:grid-cols-[2fr_1.4fr_1fr_1fr]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título o descripción…"
            className="field focus:field-focus"
            aria-label="Texto de búsqueda"
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="field focus:field-focus"
            aria-label="Categoría"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            value={precioMin}
            onChange={(e) => setPrecioMin(e.target.value)}
            placeholder="Precio mín."
            className="field focus:field-focus"
            aria-label="Precio mínimo"
          />
          <input
            type="number"
            min={0}
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            placeholder="Precio máx."
            className="field focus:field-focus"
            aria-label="Precio máximo"
          />
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          {isFetching ? "Buscando…" : `${resultados.length} resultado(s)`}
        </p>

        {resultados.length === 0 && !isFetching ? (
          <div className="surface mt-4 flex flex-col items-center gap-2 p-12 text-center">
            <SearchX className="size-8 text-muted-foreground" />
            <p className="font-semibold">Sin resultados</p>
            <p className="text-sm text-muted-foreground">Probá con otro texto o ampliá el rango de precio.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resultados.map((p) => (
              <PublicacionCard key={p.id} publicacion={p} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
