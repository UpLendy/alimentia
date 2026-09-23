"use client";

import { useState } from "react";
import { AlertCircle, Check, Loader2, MapPin, Pencil, Plus, Power, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { api, ApiError, type Zone } from "@/lib/api";
import { useSedes } from "@/hooks/useSedes";

interface ZonesCardProps {
  canEdit: boolean;
}

// Sección "Zonas" de /settings: catálogo de zonas/áreas físicas por sede que
// alimenta los selects de instalaciones, plagas, almacenamiento y equipo
// (antes listas quemadas en cada formulario). Mismo patrón de layout que
// BusinessProfileFormsCard; a diferencia de esa sección, acá canEdit incluye
// admin y supervisor porque así lo define el backend de zones
// (requireRole(["admin","supervisor","bpm_admin"]) en POST/PATCH /zones).
export function ZonesCard({ canEdit }: ZonesCardProps) {
  const { sedes, sedesError, sedeId, setSedeId, showSedeSelector } = useSedes();

  const [zones, setZones] = useState<Zone[] | null>(null);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [zonesError, setZonesError] = useState<string | null>(null);
  const [loadedForSedeId, setLoadedForSedeId] = useState<string | null>(null);

  const [newZoneName, setNewZoneName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const loadZones = async (forSedeId: string) => {
    setZonesLoading(true);
    setZonesError(null);
    try {
      const data = await api.get<Zone[]>(`/zones?sedeId=${forSedeId}&includeInactive=true`);
      setZones(data);
      setLoadedForSedeId(forSedeId);
    } catch (err) {
      setZonesError(err instanceof ApiError ? err.message : "No se pudieron cargar las zonas.");
    } finally {
      setZonesLoading(false);
    }
  };

  if (sedeId && sedeId !== loadedForSedeId && !zonesLoading) {
    loadZones(sedeId);
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sedeId || !newZoneName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const { zone } = await api.post<{ zone: Zone }>("/zones", { sedeId, name: newZoneName.trim() });
      setZones((prev) => [...(prev ?? []), zone]);
      setNewZoneName("");
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "No se pudo crear la zona.");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (zone: Zone) => {
    setEditingId(zone.id);
    setEditingName(zone.name);
    setRowError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveEdit = async (zone: Zone) => {
    const name = editingName.trim();
    if (!name || name === zone.name) {
      cancelEdit();
      return;
    }
    setSavingId(zone.id);
    setRowError(null);
    try {
      const { zone: updated } = await api.patch<{ zone: Zone }>(`/zones/${zone.id}`, { name });
      setZones((prev) => (prev ?? []).map((z) => (z.id === updated.id ? updated : z)));
      cancelEdit();
    } catch (err) {
      setRowError(err instanceof ApiError ? err.message : "No se pudo renombrar la zona.");
    } finally {
      setSavingId(null);
    }
  };

  const toggleActive = async (zone: Zone) => {
    setSavingId(zone.id);
    setRowError(null);
    try {
      const { zone: updated } = await api.patch<{ zone: Zone }>(`/zones/${zone.id}`, { active: !zone.active });
      setZones((prev) => (prev ?? []).map((z) => (z.id === updated.id ? updated : z)));
    } catch (err) {
      setRowError(err instanceof ApiError ? err.message : "No se pudo actualizar el estado de la zona.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Zonas</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Áreas físicas de cada sede (bodegas, cuartos, zonas de producción) usadas en los formatos diarios y en el registro de equipos.
          </p>
        </div>
      </div>

      {sedesError && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <span>{sedesError}</span>
        </div>
      )}

      {showSedeSelector && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sede</label>
          <select
            value={sedeId}
            onChange={(e) => setSedeId(e.target.value)}
            className="w-full sm:w-72 bg-white dark:bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
          >
            <option value="" disabled>
              Selecciona una sede
            </option>
            {sedes?.map((sede) => (
              <option key={sede.id} value={sede.id}>
                {sede.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {!sedeId && !sedesError && (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-border rounded-xl px-4 py-6 text-sm text-slate-500 dark:text-slate-400 text-center">
          Selecciona una sede para ver sus zonas.
        </div>
      )}

      {sedeId && zonesLoading && (
        <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando zonas...
        </div>
      )}

      {sedeId && !zonesLoading && zonesError && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <span className="inline-flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {zonesError}
          </span>
          <button
            type="button"
            onClick={() => loadZones(sedeId)}
            className="inline-flex items-center gap-1.5 font-medium hover:underline shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reintentar
          </button>
        </div>
      )}

      {sedeId && !zonesLoading && !zonesError && zones && (
        <div className="space-y-4">
          {zones.length === 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-400 px-4 py-6 rounded-xl text-sm font-medium text-center">
              {canEdit
                ? "Esta sede todavía no tiene zonas creadas. Agrega la primera abajo."
                : "Esta sede todavía no tiene zonas creadas."}
            </div>
          )}

          {zones.length > 0 && (
            <ul className="divide-y divide-border/50 border border-border/50 rounded-lg overflow-hidden">
              {zones.map((zone) => (
                <li
                  key={zone.id}
                  className="flex items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-slate-900"
                >
                  {editingId === zone.id ? (
                    <input
                      type="text"
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <span
                      className={cn(
                        "text-sm",
                        zone.active
                          ? "text-slate-700 dark:text-slate-300"
                          : "text-slate-400 dark:text-slate-500 line-through"
                      )}
                    >
                      {zone.name}
                    </span>
                  )}

                  <div className="flex items-center gap-2 shrink-0">
                    {!canEdit && (
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          zone.active
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        )}
                      >
                        {zone.active ? "Activa" : "Desactivada"}
                      </span>
                    )}

                    {canEdit && savingId === zone.id && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}

                    {canEdit && savingId !== zone.id && editingId === zone.id && (
                      <>
                        <button
                          type="button"
                          onClick={() => saveEdit(zone)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          aria-label="Guardar nombre"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          aria-label="Cancelar edición"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {canEdit && savingId !== zone.id && editingId !== zone.id && (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(zone)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          aria-label={`Editar nombre de ${zone.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActive(zone)}
                          className={cn(
                            "p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800",
                            zone.active ? "text-red-500" : "text-emerald-600"
                          )}
                          aria-label={zone.active ? `Desactivar ${zone.name}` : `Reactivar ${zone.name}`}
                          title={zone.active ? "Desactivar zona" : "Reactivar zona"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {rowError && (
            <div className="rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {rowError}
            </div>
          )}

          {canEdit && (
            <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border/50">
              <input
                type="text"
                required
                placeholder="Nombre de la nueva zona (ej: Cuarto Frío de Lácteos)"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
              />
              <button
                type="submit"
                disabled={creating || !newZoneName.trim()}
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Agregar zona
              </button>
            </form>
          )}

          {createError && (
            <div className="rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {createError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
