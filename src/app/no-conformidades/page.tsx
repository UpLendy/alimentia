"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ShieldAlert,
  AlertCircle,
  Plus,
  RefreshCw,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import {
  api,
  ApiError,
  type NonConformity,
  type NonConformitySeverity,
  type NonConformityStatus,
  type NewNonConformityInput,
  type ContaminationType,
  type ValidationErrorDetail,
} from "@/lib/api";
import { useSedes } from "@/hooks/useSedes";
import { useAuth } from "@/components/auth/AuthProvider";

const STATUS_LABEL: Record<NonConformityStatus, string> = {
  abierta: "Abierta",
  en_proceso: "En Proceso",
  cerrada: "Cerrada",
};

const STATUS_STYLE: Record<NonConformityStatus, string> = {
  abierta: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  en_proceso: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  cerrada: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const SEVERITY_LABEL: Record<NonConformitySeverity, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
};

const SEVERITY_STYLE: Record<NonConformitySeverity, string> = {
  baja: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  media: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  alta: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const CONTAMINATION_TYPE_LABEL: Record<ContaminationType, string> = {
  fisica: "Física",
  quimica: "Química",
  biologica: "Biológica",
};

type FilterTab = "todas" | "abiertas" | "cerradas";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function NonConformityRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-4"><div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
    </tr>
  );
}

export default function NoConformidades() {
  const { user } = useAuth();
  const { sedes, sedesError, sedeId, setSedeId, showSedeSelector } = useSedes();

  const [items, setItems] = useState<NonConformity[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("todas");

  // Formulario de creación (manual). El backend ya acepta sourceType
  // "formato" con sourceReferenceId para cuando un formato diario con
  // hallazgos negativos pueda originar una no conformidad automáticamente;
  // este formulario solo cubre el alta manual por ahora.
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<NonConformitySeverity>("media");
  const [contaminationType, setContaminationType] = useState<ContaminationType | "">("");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [validationDetails, setValidationDetails] = useState<ValidationErrorDetail[] | null>(null);

  // Cierre de una no conformidad (PATCH /non-conformities/:id/close): exige
  // acción correctiva no vacía, validado en el backend.
  const [closingId, setClosingId] = useState<string | null>(null);
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    try {
      const data = await api.get<NonConformity[]>("/non-conformities");
      setItems(data);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "No se pudieron cargar las no conformidades.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadItems();
    })();
  }, [loadItems]);

  const retry = () => {
    setIsLoading(true);
    setLoadError(null);
    loadItems();
  };

  const list = items ?? [];
  const openCount = list.filter((i) => i.status !== "cerrada").length;
  const closedCount = list.filter((i) => i.status === "cerrada").length;
  const visible = list.filter((i) => {
    if (filter === "abiertas") return i.status !== "cerrada";
    if (filter === "cerradas") return i.status === "cerrada";
    return true;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sedeId) {
      setFormError("Selecciona una sede antes de registrar la no conformidad.");
      setValidationDetails(null);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setValidationDetails(null);

    try {
      const input: NewNonConformityInput = {
        sedeId,
        sourceType: "manual",
        description,
        severity,
        contaminationType: contaminationType || undefined,
        responsibleUserId: user?.id,
        dueDate: dueDate || undefined,
      };
      const { nonConformity } = await api.post<{ nonConformity: NonConformity }>("/non-conformities", input);
      setItems((prev) => [nonConformity, ...(prev ?? [])]);
      setDescription("");
      setSeverity("media");
      setContaminationType("");
      setDueDate("");
      setShowForm(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        setValidationDetails(err.details ?? null);
      } else {
        setFormError("No se pudo registrar la no conformidad.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const startClosing = (item: NonConformity) => {
    setClosingId(item.id);
    setCorrectiveAction(item.correctiveAction ?? "");
    setCloseError(null);
  };

  const cancelClosing = () => {
    setClosingId(null);
    setCorrectiveAction("");
    setCloseError(null);
  };

  const handleClose = async (id: string) => {
    setIsClosing(true);
    setCloseError(null);
    try {
      const { nonConformity } = await api.patch<{ nonConformity: NonConformity }>(
        `/non-conformities/${id}/close`,
        { correctiveAction },
      );
      setItems((prev) => (prev ?? []).map((i) => (i.id === id ? nonConformity : i)));
      setClosingId(null);
      setCorrectiveAction("");
    } catch (err) {
      setCloseError(err instanceof ApiError ? err.message : "No se pudo cerrar la no conformidad.");
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 p-2 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            No Conformidades
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Gestión de hallazgos, acciones correctivas y cierre (CAPA).
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-red-500/30"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancelar" : "Nueva No Conformidad"}
        </button>
      </header>

      {loadError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center justify-between gap-4">
          <span className="text-sm font-medium">{loadError}</span>
          <button onClick={retry} className="flex items-center gap-2 text-sm font-medium hover:underline shrink-0">
            <RefreshCw className="w-4 h-4" /> Reintentar
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-border/50 p-6 space-y-4">
          {sedesError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
              {sedesError}
            </div>
          )}

          {showSedeSelector && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sede</label>
              <select
                required
                value={sedeId}
                onChange={(e) => setSedeId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all"
              >
                <option value="" disabled>Selecciona una sede</option>
                {sedes?.map((sede) => (
                  <option key={sede.id} value={sede.id}>{sede.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Descripción del hallazgo</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Temperatura de refrigerador fuera de rango durante el monitoreo de la mañana."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Severidad</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as NonConformitySeverity)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de contaminación (opcional)</label>
              <select
                value={contaminationType}
                onChange={(e) => setContaminationType(e.target.value as ContaminationType | "")}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all"
              >
                <option value="">Sin especificar</option>
                <option value="fisica">Física</option>
                <option value="quimica">Química</option>
                <option value="biologica">Biológica</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha límite (opcional)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Responsable</label>
              <input
                type="text"
                disabled
                value={user?.fullName ?? ""}
                className="w-full bg-slate-100 dark:bg-slate-800/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-600 dark:text-slate-400 outline-none cursor-not-allowed"
              />
            </div>
          </div>

          {formError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
              {validationDetails && validationDetails.length > 0 && (
                <ul className="list-disc list-inside text-xs space-y-1 pl-1">
                  {validationDetails.map((d, i) => (
                    <li key={i}>
                      <span className="font-mono">{d.path}</span>: {d.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              Registrar No Conformidad
            </button>
          </div>
        </form>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Abiertas / En Proceso</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{openCount}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cerradas</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{closedCount}</h3>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-slate-900 border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">Registro de No Conformidades</h2>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {(["todas", "abiertas", "cerradas"] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                  filter === tab
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Descripción</th>
                <th className="px-6 py-4 font-medium">Severidad</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Registrada</th>
                <th className="px-6 py-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <>
                  <NonConformityRowSkeleton />
                  <NonConformityRowSkeleton />
                  <NonConformityRowSkeleton />
                </>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                    No hay no conformidades para mostrar.
                  </td>
                </tr>
              ) : (
                visible.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors align-top">
                    <td className="px-6 py-4 whitespace-normal max-w-md">
                      <div className="font-medium text-slate-900 dark:text-white">{item.description}</div>
                      {item.contaminationType && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Contaminación: {CONTAMINATION_TYPE_LABEL[item.contaminationType]}
                        </div>
                      )}
                      {item.correctiveAction && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Acción correctiva: {item.correctiveAction}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${SEVERITY_STYLE[item.severity]}`}>
                        {SEVERITY_LABEL[item.severity]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[item.status]}`}>
                        {STATUS_LABEL[item.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatDate(item.createdAt)}</td>
                    <td className="px-6 py-4">
                      {item.status !== "cerrada" && (
                        closingId === item.id ? (
                          <div className="space-y-2 min-w-[220px]">
                            <textarea
                              rows={2}
                              value={correctiveAction}
                              onChange={(e) => setCorrectiveAction(e.target.value)}
                              placeholder="Acción correctiva (requerida para cerrar)"
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                            />
                            {closeError && <p className="text-xs text-red-600 dark:text-red-400">{closeError}</p>}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleClose(item.id)}
                                disabled={isClosing}
                                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                              >
                                {isClosing ? "Cerrando..." : "Confirmar cierre"}
                              </button>
                              <button
                                onClick={cancelClosing}
                                disabled={isClosing}
                                className="px-3 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => startClosing(item)}
                            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium text-sm"
                          >
                            Cerrar
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
