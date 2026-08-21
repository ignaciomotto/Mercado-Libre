import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Folder, FolderOpen, Tag } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import {
  formatearPrecio,
  getArbolCategorias,
  getTopPublicacionesCategoria,
  type CategoriaNodo,
} from "@/lib/api";

export const Route = createFileRoute("/categorias")({
  head: () => ({
    meta: [
      { title: "Árbol de categorías — Feria" },
      { name: "description", content: "Explorá el árbol completo de categorías y las publicaciones más vendidas de cada rama." },
      { property: "og:title", content: "Árbol de categorías — Feria" },
      { property: "og:description", content: "Categorías jerárquicas y top de publicaciones vendidas por rama." },
    ],
  }),
  component: Categorias,
});

function Nodo({
  nodo,
  nivel,
  seleccionada,
  onSelect,
}: {
  nodo: CategoriaNodo;
  nivel: number;
  seleccionada: number | null;
  onSelect: (id: number) => void;
}) {
  const [abierto, setAbierto] = useState(nivel < 1);
  const hoja = nodo.hijas.length === 0;

  return (
    <li>
      <div
        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-secondary ${
          seleccionada === nodo.id ? "bg-secondary font-semibold" : ""
        }`}
        style={{ paddingLeft: `${nivel * 18 + 8}px` }}
      >
        {!hoja ? (
          <button onClick={() => setAbierto((a) => !a)} aria-label="Expandir" className="text-muted-foreground">
            <ChevronRight className={`size-4 transition-transform ${abierto ? "rotate-90" : ""}`} />
          </button>
        ) : (
          <span className="size-4" />
        )}
        {hoja ? (
          <Tag className="size-4 text-accent" />
        ) : abierto ? (
          <FolderOpen className="size-4 text-muted-foreground" />
        ) : (
          <Folder className="size-4 text-muted-foreground" />
        )}
        <button onClick={() => onSelect(nodo.id)} className="text-left">
          {nodo.nombre}
        </button>
        {hoja && <span className="ml-auto text-xs text-muted-foreground">hoja</span>}
      </div>
      {abierto && !hoja && (
        <ul>
          {nodo.hijas.map((h) => (
            <Nodo key={h.id} nodo={h} nivel={nivel + 1} seleccionada={seleccionada} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  );
}

function Categorias() {
  const [seleccionada, setSeleccionada] = useState<number | null>(1);
  const { data: arbol = [] } = useQuery({ queryKey: ["categorias", "arbol"], queryFn: getArbolCategorias });
  const { data: top = [] } = useQuery({
    queryKey: ["categorias", seleccionada, "top-publicaciones"],
    queryFn: () => getTopPublicacionesCategoria(seleccionada!),
    enabled: seleccionada != null,
  });

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-extrabold">Categorías</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Estructura anidada completa. Una categoría puede tener padre o ser raíz; nunca puede ser
          descendiente de sí misma.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="surface p-4">
            <h2 className="mb-3 px-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Árbol
            </h2>
            <ul>
              {arbol.map((n) => (
                <Nodo key={n.id} nodo={n} nivel={0} seleccionada={seleccionada} onSelect={setSeleccionada} />
              ))}
            </ul>
          </div>

          <div className="surface p-6">
            <h2 className="text-lg font-bold">Top 5 más vendidas</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Solo compras finalizadas, incluyendo subcategorías descendientes.
            </p>
            <ol className="mt-5 space-y-3">
              {top.map((item, i) => (
                <li key={item.publicacion.id} className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <Link
                    to="/publicaciones/$publicacionId"
                    params={{ publicacionId: String(item.publicacion.id) }}
                    className="min-w-0 flex-1"
                  >
                    <p className="truncate text-sm font-semibold hover:underline">{item.publicacion.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatearPrecio(item.publicacion.precio)}
                    </p>
                  </Link>
                  <span className="shrink-0 text-sm font-bold">{item.unidades_vendidas} u.</span>
                </li>
              ))}
              {top.length === 0 && (
                <li className="text-sm text-muted-foreground">Sin publicaciones en esta rama.</li>
              )}
            </ol>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
