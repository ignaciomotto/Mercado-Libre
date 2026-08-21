import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
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

  useEffect(() => {
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      setListo(true);
      return;
    }
    getUsuarioActual()
      .then(setUsuario)
      .catch(() => window.localStorage.removeItem(STORAGE_KEY))
      .finally(() => setListo(true));
  }, []);

  const iniciar = useCallback((nuevo: Usuario) => {
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
