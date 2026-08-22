import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cerrarSesion, getUsuarioActual, type Usuario } from "./api";

interface SessionValue {
  usuario: Usuario | null;
  iniciar: (usuario: Usuario) => void;
  cerrar: () => void;
  listo: boolean;
}

const SessionContext = createContext<SessionValue>({
  usuario: null,
  iniciar: () => {},
  cerrar: () => {},
  listo: false,
});

const STORAGE_KEY = "marketplace.sesion";

export function SessionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [listo, setListo] = useState(false);
  const sessionVersion = useRef(0);

  useEffect(() => {
    const requestVersion = sessionVersion.current;
    getUsuarioActual()
      .then((usuarioActual) => {
        if (requestVersion !== sessionVersion.current) return;
        window.localStorage.setItem(STORAGE_KEY, String(usuarioActual.id));
        setUsuario(usuarioActual);
      })
      .catch(() => {
        if (requestVersion !== sessionVersion.current) return;
        window.localStorage.removeItem(STORAGE_KEY);
        setUsuario(null);
      })
      .finally(() => {
        if (requestVersion === sessionVersion.current) setListo(true);
      });
  }, []);

  const iniciar = useCallback((nuevo: Usuario) => {
    sessionVersion.current += 1;
    window.localStorage.setItem(STORAGE_KEY, String(nuevo.id));
    setUsuario(nuevo);
  }, []);

  const cerrar = useCallback(() => {
    void cerrarSesion().catch(() => undefined);
    window.localStorage.removeItem(STORAGE_KEY);
    setUsuario(null);
  }, []);

  const value = useMemo(() => ({ usuario, iniciar, cerrar, listo }), [usuario, iniciar, cerrar, listo]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);
