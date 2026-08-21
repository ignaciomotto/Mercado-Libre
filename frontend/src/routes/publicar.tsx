import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { crearPublicacion, getCategorias } from "@/lib/api";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/publicar")({
  head: () => ({
    meta: [
      { title: "Publicar producto — Feria" },
      { name: "description", content: "Publicá un producto en venta: precio y stock mayores a 0, y una categoría hoja." },
      { property: "og:title", content: "Publicar producto — Feria" },
      { property: "og:description", content: "Creá tu publicación en Feria en menos de un minuto." },
    ],
  }),
  component: Publicar,
});

function Publicar() {
  const { usuario } = useSession();
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: categorias = [] } = useQuery({ queryKey: ["categorias"], queryFn: getCategorias });
  const padres = new Set(categorias.map((categoria) => categoria.categoria_padre_id).filter((id): id is number => id != null));
  const hojas = categorias.filter((categoria) => !padres.has(categoria.id));

  const mut = useMutation({
    mutationFn: () =>
      crearPublicacion({
        titulo,
        descripcion,
        precio: Number(precio),
        stock: Number(stock),
        categoria_id: Number(categoriaId),
        vendedor_id: usuario!.id,
      }),
    onSuccess: (p) =>
      navigate({ to: "/publicaciones/$publicacionId", params: { publicacionId: String(p.id) } }),
    onError: (e: Error) => setError(e.message),
  });

  if (!usuario) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="text-2xl font-extrabold">Necesitás una cuenta</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Iniciá sesión para publicar productos en venta.
          </p>
          <button onClick={() => navigate({ to: "/login" })} className="btn-base btn-ink mt-6 hover:brightness-110">
            Iniciar sesión
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <h1 className="text-3xl font-extrabold">Publicar producto</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          La publicación arranca en estado <strong>activa</strong>. Solo se admiten categorías hoja.
        </p>

        <form
          className="surface mt-8 space-y-5 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            mut.mutate();
          }}
        >
          <div>
            <label htmlFor="titulo" className="mb-1.5 block text-sm font-semibold">Título</label>
            <input id="titulo" required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="field focus:field-focus" />
          </div>
          <div>
            <label htmlFor="descripcion" className="mb-1.5 block text-sm font-semibold">Descripción</label>
            <textarea id="descripcion" required rows={4} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="field focus:field-focus resize-y" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="precio" className="mb-1.5 block text-sm font-semibold">Precio</label>
              <input id="precio" type="number" min={1} required value={precio} onChange={(e) => setPrecio(e.target.value)} className="field focus:field-focus" />
              <p className="mt-1 text-xs text-muted-foreground">Debe ser mayor a 0.</p>
            </div>
            <div>
              <label htmlFor="stock" className="mb-1.5 block text-sm font-semibold">Stock</label>
              <input id="stock" type="number" min={1} required value={stock} onChange={(e) => setStock(e.target.value)} className="field focus:field-focus" />
              <p className="mt-1 text-xs text-muted-foreground">Debe ser mayor a 0.</p>
            </div>
          </div>
          <div>
            <label htmlFor="categoria" className="mb-1.5 block text-sm font-semibold">Categoría (hoja)</label>
            <select id="categoria" required value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="field focus:field-focus">
              <option value="">Elegí una categoría…</option>
              {hojas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

          <button type="submit" disabled={mut.isPending} className="btn-base btn-primary w-full hover:brightness-105 disabled:opacity-60">
            {mut.isPending ? "Publicando…" : "Publicar"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
