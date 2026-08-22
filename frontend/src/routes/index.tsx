import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck, MessagesSquare, Star } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PublicacionCard } from "@/components/PublicacionCard";
import { buscarPublicaciones, getTopVendedores } from "@/lib/api";
import heroImg from "@/assets/hero-feria.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bazar Libre — Comprá y vendé entre personas" },
      {
        name: "description",
        content:
          "Marketplace para publicar productos, preguntar antes de comprar y calificar a la otra parte. Buscá por categoría y precio.",
      },
      { property: "og:title", content: "Bazar Libre — Comprá y vendé entre personas" },
      {
        property: "og:description",
        content: "Publicá, preguntá, comprá y calificá. Un marketplace simple y transparente.",
      },
    ],
  }),
  component: Inicio,
});

function Inicio() {
  const { data: destacadas = [] } = useQuery({
    queryKey: ["publicaciones", "destacadas"],
    queryFn: () => buscarPublicaciones({}),
  });
  const { data: top = [] } = useQuery({ queryKey: ["vendedores", "top"], queryFn: getTopVendedores });

  return (
    <AppLayout>
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Compra y venta entre personas
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] md:text-6xl">
              Todo lo que buscás,
              <br />
              publicado por alguien cerca.
            </h1>
            <p className="mt-5 max-w-md text-base text-muted-foreground">
              Publicá en minutos, respondé preguntas de compradores y construí tu reputación con
              cada venta finalizada.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/publicaciones" className="btn-base btn-ink hover:brightness-110">
                Explorar publicaciones
                <ArrowRight className="size-4" />
              </Link>
              <Link to="/registro" className="btn-base btn-primary hover:brightness-105">
                Crear cuenta gratis
              </Link>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroImg}
              alt="Objetos usados en venta ordenados sobre una mesa de madera"
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-[var(--shadow-lift)]"
              loading="eager"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: MessagesSquare, titulo: "Preguntá antes de comprar", texto: "Cada publicación tiene su hilo de preguntas y respuestas del vendedor." },
            { icon: ShieldCheck, titulo: "Compras cancelables", texto: "Mientras la compra esté pendiente podés cancelarla y el stock vuelve." },
            { icon: Star, titulo: "Reputación real", texto: "Promedio de calificaciones recibidas, visible desde 3 opiniones." },
          ].map(({ icon: Icon, titulo, texto }) => (
            <div key={titulo} className="surface p-5">
              <Icon className="size-5 text-accent" />
              <h3 className="mt-3 text-base font-bold">{titulo}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold">Publicaciones activas</h2>
          <Link to="/publicaciones" className="text-sm font-semibold text-accent hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {destacadas.slice(0, 4).map((p) => (
            <PublicacionCard key={p.id} publicacion={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20">
        <div className="surface p-6">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-bold">Mejores vendedores</h2>
            <Link to="/vendedores/top" className="text-sm font-semibold text-accent hover:underline">
              Ver ranking
            </Link>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {top.slice(0, 3).map((v, i) => (
              <li key={v.usuario.id} className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3">
                <span className="grid size-8 place-items-center rounded-full bg-primary font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{v.usuario.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {v.usuario.reputacion?.toFixed(1)} ★ · {v.ventas_finalizadas} ventas
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AppLayout>
  );
}
