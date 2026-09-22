"use client";

import { useEffect, useState } from "react";
import { api, ApiError, type Zone } from "@/lib/api";

// Zonas activas de una sede (GET /zones?sedeId=). El backend ya excluye las
// desactivadas por defecto, así que los formatos diarios y el selector de
// ubicación de equipos (que nunca deben ofrecer una zona desactivada para
// registros nuevos) no necesitan filtrar nada más acá.
export function useZones(sedeId: string) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [zonesError, setZonesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!sedeId) {
        setZones([]);
        return;
      }
      setZonesLoading(true);
      setZonesError(null);
      try {
        const data = await api.get<Zone[]>(`/zones?sedeId=${sedeId}`);
        if (cancelled) return;
        setZones(data);
      } catch (err) {
        if (cancelled) return;
        setZonesError(err instanceof ApiError ? err.message : "No se pudieron cargar las zonas.");
        setZones([]);
      } finally {
        if (!cancelled) setZonesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sedeId]);

  return { zones, zonesLoading, zonesError };
}
