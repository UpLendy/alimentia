"use client";

import { useState } from "react";
import { Loader2, Settings2 } from "lucide-react";
import { api, ApiError, type Company, type CompanyPlan, type CompanyStatus } from "@/lib/api";

const PLAN_LABELS: Record<CompanyPlan, string> = {
  basico: "Básico",
  pro: "Pro",
  plus: "Plus",
};

const PLAN_OPTIONS: CompanyPlan[] = ["basico", "pro", "plus"];

const STATUS_LABELS: Record<CompanyStatus, string> = {
  prueba: "Prueba",
  activo: "Activo",
  suspendido: "Suspendido",
};

const STATUS_OPTIONS: CompanyStatus[] = ["prueba", "activo", "suspendido"];

interface CompanyPlanStatusCardProps {
  companyId: string;
  company: Company;
  onCompanyChange: (company: Company) => void;
}

// Cambiar plan/estado está restringido a bpm_admin en el backend
// (assertCanSetPlanOrStatus). La página que monta este card ya bloquea
// cualquier otro rol antes de llegar aquí, así que a diferencia de
// BusinessProfileFormsCard no necesita un prop canEdit.
export function CompanyPlanStatusCard({ companyId, company, onCompanyChange }: CompanyPlanStatusCardProps) {
  const [error, setError] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<"plan" | "status" | null>(null);

  const handleChange = async (field: "plan" | "status", value: string) => {
    setSavingField(field);
    setError(null);
    try {
      const { company: updated } = await api.patch<{ company: Company }>(`/companies/${companyId}`, {
        [field]: value,
      });
      onCompanyChange(updated);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : `No se pudo actualizar el ${field === "plan" ? "plan" : "estado"}.`
      );
    } finally {
      setSavingField(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
          <Settings2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Plan y estado</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Solo el staff de BPM Consulting puede cambiar el plan o el estado de una empresa.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Plan</label>
          <div className="flex items-center gap-3">
            <select
              value={company.plan}
              onChange={(e) => handleChange("plan", e.target.value)}
              disabled={savingField === "plan"}
              className="w-full bg-white dark:bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-60"
            >
              {PLAN_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {PLAN_LABELS[p]}
                </option>
              ))}
            </select>
            {savingField === "plan" && <Loader2 className="w-4 h-4 animate-spin text-slate-400 shrink-0" />}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Estado</label>
          <div className="flex items-center gap-3">
            <select
              value={company.status}
              onChange={(e) => handleChange("status", e.target.value)}
              disabled={savingField === "status"}
              className="w-full bg-white dark:bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-60"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            {savingField === "status" && <Loader2 className="w-4 h-4 animate-spin text-slate-400 shrink-0" />}
          </div>
        </div>
      </div>
    </div>
  );
}
