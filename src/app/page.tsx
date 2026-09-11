"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Clock, FileText, Activity, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  api,
  ApiError,
  type DashboardAlert,
  type DashboardAlertSeverity,
  type DashboardAlertType,
  type DashboardSummary,
} from "@/lib/api";

const alertTypeMeta: Record<DashboardAlertType, { icon: LucideIcon; actionLabel: string; href: string }> = {
  examen_medico: { icon: AlertCircle, actionLabel: "Gestionar", href: "/personal" },
  calibracion: { icon: Clock, actionLabel: "Ver Equipo", href: "/infraestructura" },
};

const alertSeverityMeta: Record<
  DashboardAlertSeverity,
  { wrapper: string; badge: string; buttonClass: string }
> = {
  vencido: {
    wrapper: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50",
    badge: "text-red-500",
    buttonClass:
      "bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/40 dark:hover:bg-red-900/60 dark:text-red-300",
  },
  por_vencer: {
    wrapper: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50",
    badge: "text-amber-500",
    buttonClass:
      "bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 dark:text-amber-300",
  },
  vigente: {
    wrapper: "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700",
    badge: "text-slate-400",
    buttonClass:
      "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300",
  },
};

function AlertRow({ alert }: { alert: DashboardAlert }) {
  const typeMeta = alertTypeMeta[alert.type];
  const severityMeta = alertSeverityMeta[alert.severity];
  const Icon = typeMeta.icon;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl gap-4 ${severityMeta.wrapper}`}
    >
      <div className="flex items-center gap-4">
        <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
          <Icon className={`w-5 h-5 ${severityMeta.badge}`} />
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white">{alert.title}</h4>
          <p className="text-sm text-slate-500">{alert.detail}</p>
        </div>
      </div>
      <Link
        href={typeMeta.href}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap text-center ${severityMeta.buttonClass}`}
      >
        {typeMeta.actionLabel}
      </Link>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="h-full bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm animate-pulse">
      <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded mt-3" />
      <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded mt-2" />
    </div>
  );
}

function AlertRowSkeleton() {
  return (
    <div className="p-4 border border-border/50 rounded-xl animate-pulse flex items-center gap-4">
      <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // El Dashboard resume la operación de UNA empresa cliente (companyId).
  // bpm_admin (staff de BPM Consulting, companyId null) no tiene una
  // empresa propia que resumir acá — su panel real es /admin/companies.
  useEffect(() => {
    if (isAuthLoading) return;
    if (user?.role === "bpm_admin") {
      router.replace("/admin/companies");
    }
  }, [isAuthLoading, user, router]);

  const loadSummary = useCallback(async () => {
    try {
      const data = await api.get<DashboardSummary>("/dashboard/summary");
      setSummary(data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar el dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "bpm_admin") return;
    (async () => {
      await loadSummary();
    })();
  }, [user, loadSummary]);

  if (isAuthLoading || user?.role === "bpm_admin") return null;

  const retry = () => {
    setIsLoading(true);
    setError(null);
    loadSummary();
  };

  const stats = summary?.stats;
  const alerts = summary?.alerts ?? [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Resumen general del estado de cumplimiento y documentación.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-border rounded-lg shadow-sm text-sm font-medium flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Sistema en Línea
          </div>
        </div>
      </header>

      {error && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/40 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={retry}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/40 dark:hover:bg-red-900/60 dark:text-red-300 text-sm font-medium rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      )}

      {/* Stats Cards - Now clickable */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Link href="/personal" className="block focus:outline-none focus:ring-2 focus:ring-red-500 rounded-2xl">
              <div className="h-full bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-red-300 dark:hover:border-red-900/50 transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <AlertCircle className="w-24 h-24 text-red-500" />
                </div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Acción Requerida</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                      {stats?.medicalExamsCritical ?? 0}
                    </h3>
                    <p className="text-sm text-red-500 font-medium mt-1">
                      Certificados médicos vencidos o por vencer
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/formatos" className="block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl">
              <div className="h-full bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-900/50 transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <FileText className="w-24 h-24 text-blue-500" />
                </div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Formatos de Hoy</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                      {stats?.dailyFormsFilledToday ?? 0}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Tipos de formato diligenciados hoy</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/cumplimiento" className="block focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-2xl">
              <div className="h-full bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-900/50 transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <CheckCircle2 className="w-24 h-24 text-emerald-500" />
                </div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cumplimiento</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                      {stats?.equipmentCalibratedPct ?? 0}%
                    </h3>
                    <p className="text-sm text-emerald-600 font-medium mt-1 group-hover:underline">
                      Equipos con calibración vigente
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Quick Actions / Pending Forms */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Formatos por llenar hoy</h2>
          <div className="space-y-4">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 rounded-xl gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Registro de Temperaturas</h4>
                  <p className="text-sm text-slate-500">Equipos de refrigeración y congelación</p>
                </div>
              </div>
              <Link
                href="/formatos/temperatura"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-orange-500/20 whitespace-nowrap text-center"
              >
                Llenar ahora
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 rounded-xl gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Verificación de Plagas</h4>
                  <p className="text-sm text-slate-500">Revisión visual diaria</p>
                </div>
              </div>
              <Link
                href="/formatos"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-orange-500/20 whitespace-nowrap text-center"
              >
                Llenar ahora
              </Link>
            </div>

          </div>
        </section>

        {/* Centro de Alertas */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Centro de Alertas
          </h2>
          <div className="space-y-4">
            {isLoading ? (
              <>
                <AlertRowSkeleton />
                <AlertRowSkeleton />
                <AlertRowSkeleton />
              </>
            ) : alerts.length === 0 ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Sin alertas pendientes. Todo en orden.
                </p>
              </div>
            ) : (
              alerts.map((alert) => (
                <AlertRow key={`${alert.type}-${alert.referenceId}`} alert={alert} />
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
