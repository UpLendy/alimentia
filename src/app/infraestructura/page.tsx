"use client";

import { useCallback, useEffect, useState } from "react";
import { Wrench, CheckCircle2, AlertTriangle, Plus, Search, FileText, RefreshCw } from "lucide-react";
import Link from "next/link";
import {
  api,
  ApiError,
  type CalibrationStatus,
  type EquipmentWithStatus,
} from "@/lib/api";

const statusMeta: Record<CalibrationStatus, { badge: string; label: string }> = {
  vigente: { badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Al día" },
  por_vencer: { badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", label: "Por vencer" },
  vencido: { badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", label: "Vencido" },
};

function formatDate(iso: string | null): string {
  if (!iso) return "Sin registrar";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function EquipmentRow({ item }: { item: EquipmentWithStatus }) {
  const meta = statusMeta[item.calibrationStatus];
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.name}</td>
      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{item.brandModel ?? "—"}</td>
      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatDate(item.nextCalibrationDate)}</td>
      <td className="px-6 py-4">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${meta.badge}`}>{meta.label}</span>
      </td>
      <td className="px-6 py-4">
        <Link href="/visor" className="text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium text-sm">Ver PDF</Link>
      </td>
    </tr>
  );
}

function EquipmentRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-4"><div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div></td>
      <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div></td>
      <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div></td>
      <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div></td>
      <td className="px-6 py-4"><div className="h-4 w-14 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div></td>
    </tr>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl w-12 h-12 animate-pulse"></div>
      <div className="space-y-2">
        <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

export default function InfraestructuraDashboard() {
  const [equipment, setEquipment] = useState<EquipmentWithStatus[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEquipment = useCallback(async () => {
    try {
      const data = await api.get<EquipmentWithStatus[]>("/equipment");
      setEquipment(data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar el equipo.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadEquipment();
    })();
  }, [loadEquipment]);

  const retry = () => {
    setIsLoading(true);
    setError(null);
    loadEquipment();
  };

  const list = equipment ?? [];
  const calibratedPct = list.length === 0 ? 100 : Math.round((list.filter((e) => e.calibrationStatus === "vigente").length / list.length) * 100);
  const pendingCount = list.filter((e) => e.calibrationStatus !== "vigente").length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 p-2 rounded-xl">
              <Wrench className="w-6 h-6" />
            </div>
            Infraestructura y Equipos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Gestión de calibraciones, mantenimiento y estado locativo.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/formatos/instalaciones" className="bg-white dark:bg-slate-900 border border-border text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm">
            <FileText className="w-4 h-4" />
            Inspección Locativa
          </Link>
          <Link href="/formatos/equipos" className="bg-white dark:bg-slate-900 border border-border text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm">
            <FileText className="w-4 h-4" />
            Revisión Equipos
          </Link>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center justify-between gap-4">
          <span className="text-sm font-medium">{error}</span>
          <button
            onClick={retry}
            className="flex items-center gap-2 text-sm font-medium hover:underline shrink-0"
          >
            <RefreshCw className="w-4 h-4" /> Reintentar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Equipos Calibrados</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{calibratedPct}%</h3>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Calibraciones Pendientes</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{pendingCount} Equipos</h3>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">Programa de Calibración de Equipos</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Buscar equipo..." className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none w-64 transition-all" />
            </div>
            <Link href="/infraestructura/nuevo" className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-lg transition-colors inline-flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Equipo</th>
                <th className="px-6 py-4 font-medium">Marca / Modelo</th>
                <th className="px-6 py-4 font-medium">Próxima Calibración</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Certificado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <>
                  <EquipmentRowSkeleton />
                  <EquipmentRowSkeleton />
                  <EquipmentRowSkeleton />
                </>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                    Aún no hay equipos registrados.
                  </td>
                </tr>
              ) : (
                list.map((item) => <EquipmentRow key={item.id} item={item} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
