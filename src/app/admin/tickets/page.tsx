"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareWarning, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { api, ApiError, type TicketWithDetails, type TicketStatus, type TicketType } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider";

const STATUS_LABEL: Record<TicketStatus, string> = {
  abierto: "Abierto",
  en_progreso: "En Progreso",
  resuelto: "Resuelto",
};

const STATUS_BADGE_STYLE: Record<TicketStatus, string> = {
  abierto: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  en_progreso: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  resuelto: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const TYPE_LABEL: Record<TicketType, string> = {
  bug: "Bug",
  mejora: "Mejora",
  duda: "Duda",
};

const TYPE_BADGE_STYLE: Record<TicketType, string> = {
  bug: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  mejora: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  duda: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function TicketRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-4"><div className="h-4 w-56 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-6 w-28 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" /></td>
    </tr>
  );
}

function TicketRow({
  ticket,
  onStatusChange,
}: {
  ticket: TicketWithDetails;
  onStatusChange: (id: string, status: TicketStatus) => Promise<void>;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (status: TicketStatus) => {
    setIsSaving(true);
    setError(null);
    try {
      await onStatusChange(ticket.id, status);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar el estado.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <tr className="align-top">
      <td className="px-6 py-4 whitespace-normal max-w-md">
        <div className="font-medium text-slate-900 dark:text-white">{ticket.title}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{ticket.description}</div>
        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">{ticket.pageContext}</div>
      </td>
      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
        {ticket.companyName ?? <span className="text-slate-400 italic">BPM Consulting</span>}
      </td>
      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
        <div>{ticket.creatorName}</div>
        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{formatDate(ticket.createdAt)}</div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE_STYLE[ticket.type]}`}>
          {TYPE_LABEL[ticket.type]}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_STYLE[ticket.status]}`}>
            {STATUS_LABEL[ticket.status]}
          </span>
          <select
            value={ticket.status}
            disabled={isSaving}
            onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
            className="bg-white dark:bg-slate-800 border border-border rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-60"
          >
            {(Object.keys(STATUS_LABEL) as TicketStatus[]).map((value) => (
              <option key={value} value={value}>{STATUS_LABEL[value]}</option>
            ))}
          </select>
          {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
        </div>
        {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
      </td>
    </tr>
  );
}

export default function AdminTicketsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState<TicketWithDetails[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "todas">("todas");
  const [typeFilter, setTypeFilter] = useState<TicketType | "todos">("todos");

  // Precedente existente (Checklist Maestro, src/app/admin/checklist/page.tsx)
  // solo oculta el link del sidebar y deja la ruta accesible por URL directa.
  // Acá se exige explícitamente bloquear esa vía, así que agregamos guard
  // client-side propio (no hay helper compartido de este tipo todavía).
  useEffect(() => {
    if (isAuthLoading) return;
    if (user?.role !== "bpm_admin") {
      router.replace("/");
    }
  }, [isAuthLoading, user, router]);

  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "todas") params.set("status", statusFilter);
      if (typeFilter !== "todos") params.set("type", typeFilter);
      const query = params.toString();
      const data = await api.get<TicketWithDetails[]>(`/tickets${query ? `?${query}` : ""}`);
      setTickets(data);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "No se pudieron cargar los tickets.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    if (user?.role !== "bpm_admin") return;
    (async () => {
      await loadTickets();
    })();
  }, [user, loadTickets]);

  const handleStatusChange = async (id: string, status: TicketStatus) => {
    const { ticket: updated } = await api.patch<{ ticket: TicketWithDetails }>(`/tickets/${id}`, { status });
    setTickets((prev) => (prev ?? []).map((t) => (t.id === id ? { ...updated, companyName: t.companyName, creatorName: t.creatorName } : t)));
  };

  if (isAuthLoading || user?.role !== "bpm_admin") return null;

  const list = tickets ?? [];
  const abiertosCount = list.filter((t) => t.status === "abierto").length;
  const enProgresoCount = list.filter((t) => t.status === "en_progreso").length;
  const resueltosCount = list.filter((t) => t.status === "resuelto").length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 p-2 rounded-xl">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
            Tickets
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Reportes de bugs, mejoras y dudas enviados desde la plataforma, de todas las empresas cliente.
          </p>
        </div>
        <div className="flex items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TicketStatus | "todas")}
              className="w-40 bg-white dark:bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
            >
              <option value="todas">Todos</option>
              {(Object.keys(STATUS_LABEL) as TicketStatus[]).map((value) => (
                <option key={value} value={value}>{STATUS_LABEL[value]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Tipo</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TicketType | "todos")}
              className="w-36 bg-white dark:bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
            >
              <option value="todos">Todos</option>
              {(Object.keys(TYPE_LABEL) as TicketType[]).map((value) => (
                <option key={value} value={value}>{TYPE_LABEL[value]}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {loadError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center justify-between gap-4">
          <span className="text-sm font-medium">{loadError}</span>
          <button onClick={() => loadTickets()} className="flex items-center gap-2 text-sm font-medium hover:underline shrink-0">
            <RefreshCw className="w-4 h-4" /> Reintentar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Abiertos</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{abiertosCount}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">En Progreso</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{enProgresoCount}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Resueltos</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{resueltosCount}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Reporte</th>
                <th className="px-6 py-4 font-medium">Empresa</th>
                <th className="px-6 py-4 font-medium">Creado por</th>
                <th className="px-6 py-4 font-medium">Tipo</th>
                <th className="px-6 py-4 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <>
                  <TicketRowSkeleton />
                  <TicketRowSkeleton />
                  <TicketRowSkeleton />
                </>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                    No hay tickets que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                list.map((ticket) => (
                  <TicketRow key={ticket.id} ticket={ticket} onStatusChange={handleStatusChange} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
