import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

type Status = "checking" | "online" | "offline";

interface BackendStatusContextValue {
  status: Status;
  recheck: () => void;
}

const Ctx = createContext<BackendStatusContextValue>({ status: "checking", recheck: () => {} });

export function BackendStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("checking");

  const check = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(4000) });
      setStatus(res.ok ? "online" : "offline");
    } catch {
      setStatus("offline");
    }
  }, []);

  useEffect(() => {
    check();
    const id = setInterval(check, 15_000);
    return () => clearInterval(id);
  }, [check]);

  return (
    <Ctx.Provider value={{ status, recheck: check }}>
      {children}
    </Ctx.Provider>
  );
}

export function useBackendStatus() {
  return useContext(Ctx);
}
