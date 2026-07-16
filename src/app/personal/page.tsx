"use client";

import { useCallback, useEffect, useState } from "react";
import { Users, FileCheck, BookOpen, AlertCircle, Search, Plus, RefreshCw, X, Loader2, Save } from "lucide-react";
import Link from "next/link";
import {
  api,
  ApiError,
  type EmployeeWithStatus,
  type MedicalExamStatus,
  type Training,
} from "@/lib/api";

const statusMeta: Record<MedicalExamStatus, { dot: string; badge: string }> = {
  vigente: { dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  por_vencer: { dot: "bg-amber-500 animate-pulse", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  vencido: { dot: "bg-red-500", badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

function formatDate(iso: string | null): string {
  if (!iso) return "Sin registrar";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function EmployeeRow({ employee, onSelect }: { employee: EmployeeWithStatus; onSelect: (employee: EmployeeWithStatus) => void }) {
  const meta = statusMeta[employee.medicalExamStatus];
  const hours = employee.trainingHoursCompleted;
  const total = employee.trainingHoursRequired;
  const pct = total > 0 ? Math.min(100, (hours / total) * 100) : 0;

  return (
    <tr
      onClick={() => onSelect(employee)}
      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
    >
      <td className="px-6 py-4">
        <div className="font-medium text-slate-900 dark:text-white">{employee.fullName}</div>
      </td>
      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{employee.position}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${meta.dot}`}></span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${meta.badge}`}>
            {formatDate(employee.medicalExamExpiry)}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-full max-w-[120px] bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${hours >= total ? "bg-emerald-500" : "bg-indigo-500"}`}
              style={{ width: `${pct}%` }}
            ></div>
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {hours}/{total}h
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(employee);
          }}
          className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium text-sm"
        >
          Ver capacitaciones
        </button>
      </td>
    </tr>
  );
}

function TrainingsModal({
  employee,
  onClose,
  onTrainingAdded,
}: {
  employee: EmployeeWithStatus;
  onClose: () => void;
  onTrainingAdded: (hoursAdded: number) => void;
}) {
  const [trainings, setTrainings] = useState<Training[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const [topic, setTopic] = useState("");
  const [trainingDate, setTrainingDate] = useState("");
  const [hours, setHours] = useState("");
  const [evaluationScore, setEvaluationScore] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadTrainings = useCallback(async () => {
    try {
      const data = await api.get<Training[]>(`/employees/${employee.id}/trainings`);
      setTrainings(data);
      setListError(null);
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : "No se pudo cargar el historial de capacitaciones.");
    }
  }, [employee.id]);

  useEffect(() => {
    (async () => {
      await loadTrainings();
    })();
  }, [loadTrainings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const parsedHours = Number(hours);
      const { training } = await api.post<{ training: Training }>(`/employees/${employee.id}/trainings`, {
        topic,
        trainingDate,
        hours: parsedHours,
        evaluationScore: evaluationScore ? Number(evaluationScore) : undefined,
      });
      setTrainings((prev) => [training, ...(prev ?? [])]);
      onTrainingAdded(parsedHours);
      setTopic("");
      setTrainingDate("");
      setHours("");
      setEvaluationScore("");
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "No se pudo guardar la capacitación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-border/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Capacitaciones</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{employee.fullName} — {employee.position}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Historial</h3>
            {listError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                {listError}
              </div>
            )}
            {trainings === null ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Cargando...</p>
            ) : trainings.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Aún no hay capacitaciones registradas.</p>
            ) : (
              <ul className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                {trainings.map((t) => (
                  <li key={t.id} className="px-4 py-3 flex items-center justify-between gap-4 text-sm">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{t.topic}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs">
                        {formatDate(t.trainingDate)}
                        {t.evaluationScore !== null && ` · Evaluación: ${t.evaluationScore}`}
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 shrink-0">
                      {t.hours}h
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Agregar capacitación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tema</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Manipulación de alimentos"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label>
                <input
                  type="date"
                  required
                  value={trainingDate}
                  onChange={(e) => setTrainingDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Horas</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nota de evaluación (opcional)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={evaluationScore}
                  onChange={(e) => setEvaluationScore(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {submitError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                {submitError}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Guardar Capacitación
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function EmployeeRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div></td>
      <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div></td>
      <td className="px-6 py-4"><div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div></td>
      <td className="px-6 py-4"><div className="h-2 w-28 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div></td>
      <td className="px-6 py-4"><div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div></td>
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

export default function PersonalDashboard() {
  const [employees, setEmployees] = useState<EmployeeWithStatus[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithStatus | null>(null);

  const loadEmployees = useCallback(async () => {
    try {
      const data = await api.get<EmployeeWithStatus[]>("/employees");
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar el personal.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadEmployees();
    })();
  }, [loadEmployees]);

  const retry = () => {
    setIsLoading(true);
    setError(null);
    loadEmployees();
  };

  const handleTrainingAdded = (hoursAdded: number) => {
    setEmployees((prev) =>
      prev?.map((e) =>
        e.id === selectedEmployee?.id ? { ...e, trainingHoursCompleted: e.trainingHoursCompleted + hoursAdded } : e,
      ) ?? null,
    );
    setSelectedEmployee((prev) => (prev ? { ...prev, trainingHoursCompleted: prev.trainingHoursCompleted + hoursAdded } : prev));
  };

  const list = employees ?? [];
  const criticalCount = list.filter((e) => e.medicalExamStatus !== "vigente").length;
  const totalCompleted = list.reduce((sum, e) => sum + e.trainingHoursCompleted, 0);
  const totalRequired = list.reduce((sum, e) => sum + e.trainingHoursRequired, 0);
  const trainingPct = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 p-2 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            Personal y Capacitaciones
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Gestión de exámenes médicos y plan de capacitación continuo (Res. 2674).
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/formatos/higiene" className="bg-white dark:bg-slate-900 border border-border text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm">
            <FileCheck className="w-4 h-4" />
            Checklist Higiene
          </Link>
          <Link href="/personal/nuevo" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-indigo-500/30">
            <Plus className="w-4 h-4" />
            Nuevo Empleado
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

      {/* Resumen de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Plantilla</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{list.length} Empleados</h3>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Exámenes Críticos</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{criticalCount} Vencidos/Por vencer</h3>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cumplimiento Capacitación</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{trainingPct}% Global</h3>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tabla de Empleados */}
      <div className="bg-white dark:bg-slate-900 border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">Directorio de Personal</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar empleado..." className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Empleado</th>
                <th className="px-6 py-4 font-medium">Cargo</th>
                <th className="px-6 py-4 font-medium">Examen Médico (1 año)</th>
                <th className="px-6 py-4 font-medium">Plan Capacitación (10h)</th>
                <th className="px-6 py-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <>
                  <EmployeeRowSkeleton />
                  <EmployeeRowSkeleton />
                  <EmployeeRowSkeleton />
                </>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                    Aún no hay empleados registrados.
                  </td>
                </tr>
              ) : (
                list.map((employee) => (
                  <EmployeeRow key={employee.id} employee={employee} onSelect={setSelectedEmployee} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEmployee && (
        <TrainingsModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onTrainingAdded={handleTrainingAdded}
        />
      )}
    </div>
  );
}
