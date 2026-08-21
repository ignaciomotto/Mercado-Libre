import { Link } from "@tanstack/react-router";
import { formatearPrecio, getUsuarioSync, rutaCategoria, type Publicacion } from "@/lib/api";

export function PublicacionCard({ publicacion }: { publicacion: Publicacion }) {
  const vendedor = getUsuarioSync(publicacion.vendedor_id);
  const ruta = rutaCategoria(publicacion.categoria_id);

  return (
    <Link
      to="/publicaciones/$publicacionId"
      params={{ publicacionId: String(publicacion.id) }}
      className="surface group flex flex-col p-4 transition-shadow hover:shadow-[var(--shadow-lift)]"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {ruta.map((c) => c.nombre).join(" › ")}
      </p>
      <h3 className="mt-2 line-clamp-2 font-display text-base font-bold leading-snug">
        {publicacion.titulo}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{publicacion.descripcion}</p>
      <p className="mt-4 text-2xl font-extrabold">{formatearPrecio(publicacion.precio)}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{vendedor?.nombre}</span>
        <span
          className={
            publicacion.estado === "activa"
              ? "rounded-full bg-success/15 px-2 py-0.5 font-semibold text-success"
              : "rounded-full bg-warning/20 px-2 py-0.5 font-semibold text-warning-foreground"
          }
        >
          {publicacion.estado}
        </span>
      </div>
    </Link>
  );
}
