"use client";

import { useCallback, useEffect, useState } from "react";
import { ListChecks, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import {
  api,
  ApiError,
  type Company,
  type CompanyChecklistItem,
  type ChecklistPriority,
  type ChecklistItemStatusValue,
} from "@/lib/api";

const STATUS_LABEL: Record<ChecklistItemStatusValue, string> = {
  pendiente: "Pendiente",
  en_desarrollo: "En Desarrollo",
  completo: "Completo",
};

const STATUS_BADGE_STYLE: Record<ChecklistItemStatusValue, string> = {
  pendiente: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  en_desarrollo: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  completo: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

// Igual al Excel "Checklist Maestro": la fila completa se colorea según el
// estado, no solo una etiqueta.
const STATUS_ROW_STYLE: Record<ChecklistItemStatusValue, string> = {
  pendiente: "bg-red-50/60 dark:bg-red-900/10",
  en_desarrollo: "bg-amber-50/60 dark:bg-amber-900/10",
  completo: "bg-emerald-50/60 dark:bg-emerald-900/10",
};

const PRIORITY_LABEL: Record<ChecklistPriority, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
};

const PRIORITY_BADGE_STYLE: Record<ChecklistPriority, string> = {
  baja: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  media: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  alta: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function groupByCategory(items: CompanyChecklistItem[]): [string, CompanyChecklistItem[]][] {
  const groups = new Map<string, CompanyChecklistItem[]>();
  for (const item of items) {
    const list = groups.get(item.category) ?? [];
    list.push(item);
    groups.set(item.category, list);
  }
  return Array.from(groups.entries());
}

function ChecklistRow({
  item,
  onSave,
}: {
  item: CompanyChecklistItem;
  onSave: (itemId: string, patch: { status?: ChecklistItemStatusValue; notes?: string }) => Promise<void>;
}) {
  const [notes, setNotes] = useState(item.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (status: ChecklistItemStatusValue) => {
    setIsSaving(true);
    setError(null);
    try {
      await onSave(item.id, { status });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar el estado.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotesBlur = async () => {
    if (notes === (item.notes ?? "")) return;
    setIsSaving(true);
    setError(null);
    try {
      await onSave(item.id, { notes });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron guardar las notas.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <tr className={`transition-colors align-top ${STATUS_ROW_STYLE[item.status]}`}>
      <td className="px-6 py-4 whitespace-normal max-w-md">
        <div className="font-medium text-slate-900 dark:text-white">{item.item}</div>
        {(item.appliesTo || item.normReference) && (
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-x-2">
            {item.appliesTo && <span>Aplica a: {item.appliesTo}</span>}
            {item.normReference && <span>Norma: {item.normReference}</span>}
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE_STYLE[item.priority]}`}>
          {PRIORITY_LABEL[item.priority]}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_STYLE[item.status]}`}>
            {STATUS_LABEL[item.status]}
          </span>
          <select
            value={item.status}
            disabled={isSaving}
            onChange={(e) => handleStatusChange(e.target.value as ChecklistItemStatusValue)}
            className="bg-white dark:bg-slate-800 border border-border rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-60"
          >
            {(Object.keys(STATUS_LABEL) as ChecklistItemStatusValue[]).map((value) => (
              <option key={value} value={value}>{STATUS_LABEL[value]}</option>
            ))}
          </select>
          {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
        </div>
        {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
      </td>
      <td className="px-6 py-4 min-w-[220px]">
        <textarea
          rows={2}
          value={notes}
          disabled={isSaving}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="Notas..."
          className="w-full bg-white dark:bg-slate-800 border border-border rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary transition-all resize-none disabled:opacity-60"
        />
      </td>
    </tr>
  );
}

function ChecklistRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-4"><div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-6 w-28 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-8 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
    </tr>
  );
}

export default function ChecklistMaestro() {
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState("");

  const [items, setItems] = useState<CompanyChecklistItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<Company[]>("/companies");
        setCompanies(data);
        if (data.length > 0) setCompanyId(data[0].id);
      } catch (err) {
        setCompaniesError(err instanceof ApiError ? err.message : "No se pudieron cargar las empresas.");
      }
    })();
  }, []);

  const loadItems = useCallback(async (id: string) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await api.get<CompanyChecklistItem[]>(`/companies/${id}/checklist-status`);
      setItems(data);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "No se pudo cargar el checklist.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!companyId) return;
    (async () => {
      await loadItems(companyId);
    })();
  }, [companyId, loadItems]);

  const handleSave = async (itemId: string, patch: { status?: ChecklistItemStatusValue; notes?: string }) => {
    const { item: updated } = await api.patch<{ item: CompanyChecklistItem }>(
      `/companies/${companyId}/checklist-status/${itemId}`,
      patch,
    );
    setItems((prev) => (prev ?? []).map((i) => (i.id === itemId ? updated : i)));
  };

  const list = items ?? [];
  const completedCount = list.filter((i) => i.status === "completo").length;
  const inProgressCount = list.filter((i) => i.status === "en_desarrollo").length;
  const pendingCount = list.filter((i) => i.status === "pendiente").length;
  const groups = groupByCategory(list);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 p-2 rounded-xl">
              <ListChecks className="w-6 h-6" />
            </div>
            Checklist Maestro
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Avance del catálogo de cumplimiento por empresa cliente (panel interno BPM Consulting).
          </p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Empresa cliente</label>
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            disabled={!companies || companies.length === 0}
            className="w-64 bg-white dark:bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-60"
          >
            {!companies && <option>Cargando...</option>}
            {companies?.length === 0 && <option>No hay empresas</option>}
            {companies?.map((company) => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
        </div>
      </header>

      {companiesError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
          {companiesError}
        </div>
      )}

      {loadError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center justify-between gap-4">
          <span className="text-sm font-medium">{loadError}</span>
          <button onClick={() => loadItems(companyId)} className="flex items-center gap-2 text-sm font-medium hover:underline shrink-0">
            <RefreshCw className="w-4 h-4" /> Reintentar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pendientes</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{pendingCount}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">En Desarrollo</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{inProgressCount}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completos</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{completedCount}</h3>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="bg-white dark:bg-slate-900 border border-border/50 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-border">
                <ChecklistRowSkeleton />
                <ChecklistRowSkeleton />
                <ChecklistRowSkeleton />
              </tbody>
            </table>
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-border/50 rounded-2xl shadow-sm p-10 text-center text-slate-500 dark:text-slate-400">
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            No hay ítems de checklist para mostrar.
          </div>
        ) : (
          groups.map(([category, categoryItems]) => (
            <div key={category} className="bg-white dark:bg-slate-900 border border-border/50 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border bg-slate-50/50 dark:bg-slate-800/20">
                <h2 className="font-semibold text-slate-800 dark:text-slate-200">{category}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-medium">Ítem</th>
                      <th className="px-6 py-4 font-medium">Prioridad</th>
                      <th className="px-6 py-4 font-medium">Estado</th>
                      <th className="px-6 py-4 font-medium">Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {categoryItems.map((item) => (
                      <ChecklistRow key={`${item.id}:${item.notes ?? ""}`} item={item} onSave={handleSave} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
