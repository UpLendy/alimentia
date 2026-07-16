"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError, type Sede } from "@/lib/api";

// Carga las sedes del usuario y selecciona automáticamente la única
// disponible, mostrando el selector solo cuando hay más de una (mismo
// patrón que useDailyFormSubmit, reutilizado por páginas que necesitan
// sedeId pero no todo el flujo de formatos diarios).
export function useSedes() {
  const [sedes, setSedes] = useState<Sede[] | null>(null);
  const [sedesError, setSedesError] = useState<string | null>(null);
  const [sedeId, setSedeId] = useState("");

  const loadSedes = useCallback(async () => {
    try {
      const data = await api.get<Sede[]>("/sedes");
      setSedes(data);
      if (data.length === 1) setSedeId(data[0].id);
      setSedesError(null);
    } catch (err) {
      setSedesError(err instanceof ApiError ? err.message : "No se pudieron cargar las sedes.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadSedes();
    })();
  }, [loadSedes]);

  const showSedeSelector = (sedes?.length ?? 0) > 1;

  return { sedes, sedesError, sedeId, setSedeId, showSedeSelector };
}
