import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LogOut, Search, Store, Trophy, Layers, ShoppingBag, PlusCircle } from "lucide-react";
import { useSession } from "@/lib/session";

const navLinks = [
  { to: "/publicaciones", label: "Buscar", icon: Search },
  { to: "/categorias", label: "Categorías", icon: Layers },
  { to: "/vendedores/top", label: "Top vendedores", icon: Trophy },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const { usuario, cerrar } = useSession();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Store className="size-4" />
            </span>
            Feria
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {usuario ? (
              <>
                <Link
                  to="/publicar"
                  className="btn-base btn-primary hidden hover:brightness-105 sm:inline-flex"
                >
                  <PlusCircle className="size-4" />
                  Vender
                </Link>
                <Link
                  to="/compras"
                  className="btn-base btn-outline hover:bg-secondary"
                  title="Mis compras"
                >
                  <ShoppingBag className="size-4" />
                  <span className="hidden sm:inline">Mis compras</span>
                </Link>
                <Link
                  to="/usuarios/$usuarioId"
                  params={{ usuarioId: String(usuario.id) }}
                  className="grid size-9 place-items-center rounded-full bg-ink text-sm font-bold text-ink-foreground"
                  title={usuario.nombre}
                >
                  {usuario.nombre.charAt(0)}
                </Link>
                <button
                  onClick={() => {
                    cerrar();
                    navigate({ to: "/" });
                  }}
                  className="btn-base btn-outline hover:bg-secondary"
                  title="Cerrar sesión"
                >
                  <LogOut className="size-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-base btn-outline hover:bg-secondary">
                  Iniciar sesión
                </Link>
                <Link to="/registro" className="btn-base btn-ink hover:brightness-110">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Feria — marketplace de compra y venta entre personas.</p>
          <p>Frontend demo con datos de ejemplo.</p>
        </div>
      </footer>
    </div>
  );
}
