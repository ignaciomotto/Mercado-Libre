import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Store } from "lucide-react";
import { iniciarSesion } from "@/lib/api";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Feria" },
      { name: "description", content: "Ingresá a tu cuenta de Feria para comprar, vender y responder preguntas." },
      { property: "og:title", content: "Iniciar sesión — Feria" },
      { property: "og:description", content: "Ingresá a tu cuenta de Feria para comprar y vender." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { iniciar } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const usuario = await iniciarSesion(email, password);
      iniciar(usuario);
      navigate({ to: "/publicaciones" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-ink p-12 text-ink-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Store className="size-4" />
          </span>
          Feria
        </Link>
        <div>
          <h2 className="max-w-sm text-4xl font-extrabold leading-tight">
            Volvé a tu feria: tus ventas, preguntas y compras te esperan.
          </h2>
          <p className="mt-4 max-w-sm text-sm opacity-70">
            Tu reputación se calcula con el promedio de las calificaciones que recibís.
          </p>
        </div>
        <p className="text-xs opacity-50">© {new Date().getFullYear()} Feria</p>
      </div>

      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-extrabold">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            ¿No tenés cuenta?{" "}
            <Link to="/registro" className="font-semibold text-accent hover:underline">
              Registrate
            </Link>
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
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
                placeholder="lucia@mail.com"
                className="field focus:field-focus"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field focus:field-focus"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}

            <button type="submit" disabled={cargando} className="btn-base btn-ink w-full hover:brightness-110 disabled:opacity-60">
              {cargando ? "Ingresando…" : "Ingresar"}
            </button>
          </form>

          <p className="mt-6 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
            Datos de prueba: <strong>lucia@mail.com</strong> con cualquier contraseña.
          </p>
        </div>
      </div>
    </div>
  );
}
