import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Store } from "lucide-react";
import { registrarUsuario } from "@/lib/api";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Crear cuenta — Feria" },
      { name: "description", content: "Registrate en Feria para comprar y vender. El email es único y tu reputación arranca en cero." },
      { property: "og:title", content: "Crear cuenta — Feria" },
      { property: "og:description", content: "Registrate gratis para comprar y vender en Feria." },
    ],
  }),
  component: Registro,
});

function Registro() {
  const navigate = useNavigate();
  const { iniciar } = useSession();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const usuario = await registrarUsuario({ nombre, email, password });
      iniciar(usuario);
      navigate({ to: "/publicaciones" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar el registro.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 font-display text-lg font-extrabold lg:hidden">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Store className="size-4" />
            </span>
            Feria
          </Link>
          <h1 className="text-3xl font-extrabold">Crear cuenta</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            ¿Ya tenés una?{" "}
            <Link to="/login" className="font-semibold text-accent hover:underline">
              Iniciá sesión
            </Link>
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="nombre" className="mb-1.5 block text-sm font-semibold">
                Nombre y apellido
              </label>
              <input
                id="nombre"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="field focus:field-focus"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field focus:field-focus"
              />
              <p className="mt-1 text-xs text-muted-foreground">Debe ser único, no puede repetirse.</p>
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field focus:field-focus"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}

            <button type="submit" disabled={cargando} className="btn-base btn-primary w-full hover:brightness-105 disabled:opacity-60">
              {cargando ? "Creando cuenta…" : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-6 text-xs text-muted-foreground">
            Tu reputación arranca sin calificaciones y la fecha de registro se guarda automáticamente.
          </p>
        </div>
      </div>

      <div className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold">
          <span className="grid size-8 place-items-center rounded-lg bg-ink text-ink-foreground">
            <Store className="size-4" />
          </span>
          Feria
        </Link>
        <div>
          <h2 className="max-w-sm text-4xl font-extrabold leading-tight">
            Una cuenta para comprar y vender.
          </h2>
          <p className="mt-4 max-w-sm text-sm opacity-80">
            Publicá productos, respondé preguntas y calificá a la otra parte cuando la compra
            termine.
          </p>
        </div>
        <p className="text-xs opacity-60">© {new Date().getFullYear()} Feria</p>
      </div>
    </div>
  );
}
