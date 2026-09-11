"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { History, AlertTriangle, ChevronRight } from "lucide-react";
import {
  api,
  ApiError,
  type DailyForm,
  type DailyFormType,
  type Notification,
  type Sede,
} from "@/lib/api";
import { DAILY_FORM_META, getDailyFormMeta, getResponsableLabel, shiftLabel } from "@/lib/daily-form-meta";

// Historial de solo lectura de los 10 formatos diarios (GET /daily-forms).
// No hay edición acá: una corrección de un registro ya enviado se hace con
// una observación nueva desde el formulario correspondiente, no reescribiendo
// este registro (son evidencia de cumplimiento que audita BPM Consulting).
export default function HistorialFormatos() {
  const [sedes, setSedes] = useState<Sede[] | null>(null);
  const [formType, setFormType] = useState<DailyFormType | "">("");
  const [sedeId, setSedeId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [forms, setForms] = useState<DailyForm[] | null>(null);
  const [alertedIds, setAlertedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<Sede[]>("/sedes");
        setSedes(data);
      } catch {
        setSedes([]);
      }
    })();
  }, []);

  const doSearch = useCallback(async () => {
    const params = new URLSearchParams();
    if (formType) params.set("formType", formType);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (sedeId) params.set("sedeId", sedeId);
    const qs = params.toString();

    const [formsData, notificationsData] = await Promise.all([
      api.get<DailyForm[]>(`/daily-forms${qs ? `?${qs}` : ""}`),
      api.get<Notification[]>("/notifications").catch(() => [] as Notification[]),
    ]);

    setForms(formsData);
    setAlertedIds(
      new Set(
        notificationsData
          .filter((n) => n.type === "rango_fuera_de_limite" && n.referenceTable === "daily_forms" && n.referenceId)
          .map((n) => n.referenceId as string),
      ),
    );
  }, [formType, from, to, sedeId]);

  // Usado por el botón "Buscar": da feedback inmediato (loading/error) al clic.
  const search = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await doSearch();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar el historial.");
      setForms(null);
    } finally {
      setIsLoading(false);
    }
  }, [doSearch]);

  // Búsqueda inicial al montar: isLoading ya arranca en true, así que no hace
  // falta resetear estado de forma síncrona en el efecto (evita cascading
  // render).
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      doSearch()
        .catch((err) => {
          if (cancelled) return;
          setError(err instanceof ApiError ? err.message : "No se pudo cargar el historial.");
          setForms(null);
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showSedeFilter = (sedes?.length ?? 0) > 1;
  const sedeNameById = useMemo(() => new Map((sedes ?? []).map((s) => [s.id, s.name])), [sedes]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <History className="w-8 h-8" />
            Historial de Formatos Diarios
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Consulta de solo lectura de los registros de cumplimiento enviados.
          </p>
        </div>
        <Link
          href="/formatos"
          className="text-sm font-medium text-primary hover:underline"
        >
          Volver a Formatos Diarios
        </Link>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-border/50 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de formato</label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as DailyFormType | "")}
              className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              {DAILY_FORM_META.map((m) => (
                <option key={m.formType} value={m.formType}>{m.name}</option>
              ))}
            </select>
          </div>

          {showSedeFilter && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sede</label>
              <select
                value={sedeId}
                onChange={(e) => setSedeId(e.target.value)}
                className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                {(sedes ?? []).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Desde</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hasta</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={search}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
          >
            {isLoading ? "Buscando..." : "Buscar"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900/40 p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {forms && forms.length === 0 && !error && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          No hay registros para los filtros seleccionados.
        </div>
      )}

      {forms && forms.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Turno</th>
                  <th className="px-4 py-3 font-semibold">Diligenciado por</th>
                  {showSedeFilter && <th className="px-4 py-3 font-semibold">Sede</th>}
                  <th className="px-4 py-3 font-semibold">Alerta</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {forms.map((form) => {
                  const meta = getDailyFormMeta(form.formType);
                  const Icon = meta.icon;
                  const hasAlert = alertedIds.has(form.id);
                  return (
                    <tr key={form.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 whitespace-nowrap">{form.formDate}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2">
                          <span className={`p-1.5 rounded-lg ${meta.color}`}>
                            <Icon className="w-4 h-4" />
                          </span>
                          {meta.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{shiftLabel(form.shift)}</td>
                      <td className="px-4 py-3">{getResponsableLabel(form.formType, form.payload, form.submittedBy)}</td>
                      {showSedeFilter && (
                        <td className="px-4 py-3 whitespace-nowrap">{sedeNameById.get(form.sedeId) ?? "—"}</td>
                      )}
                      <td className="px-4 py-3">
                        {hasAlert ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                            <AlertTriangle className="w-4 h-4" />
                            Fuera de rango
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/formatos/historial/${form.id}`}
                          className="inline-flex items-center text-primary font-medium hover:underline"
                        >
                          Ver detalle
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
