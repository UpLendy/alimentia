"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  api,
  ApiError,
  type BusinessProfile,
  type Company,
  type CompanyDailyFormStatus,
  type DailyFormType,
} from "@/lib/api";

const BUSINESS_PROFILE_LABELS: Record<BusinessProfile, string> = {
  restaurante_general: "Restaurante general",
  carnicos: "Cárnicos",
  fabrica: "Fábrica / planta de producción",
  bodega_almacenamiento: "Bodega / almacenamiento",
};

const BUSINESS_PROFILE_OPTIONS: BusinessProfile[] = [
  "restaurante_general",
  "carnicos",
  "fabrica",
  "bodega_almacenamiento",
];

const DAILY_FORM_LABELS: Record<DailyFormType, string> = {
  temperatura: "Registro de Temperaturas",
  plagas: "Control de Plagas",
  agua: "Calidad del Agua",
  residuos: "Residuos Sólidos y Líquidos",
  materias_primas: "Recepción de Materias Primas",
  higiene: "Higiene de Personal",
  almacenamiento: "Almacenamiento (PEPS)",
  transporte: "Inspección de Transporte",
  instalaciones: "Inspección Locativa",
  equipos: "Estado de Equipos",
};

const DAILY_FORM_ORDER: DailyFormType[] = [
  "temperatura",
  "plagas",
  "agua",
  "residuos",
  "materias_primas",
  "higiene",
  "almacenamiento",
  "transporte",
  "instalaciones",
  "equipos",
];

interface ToggleSwitchProps {
  checked: boolean;
  loading?: boolean;
  onChange: () => void;
  label: string;
}

function ToggleSwitch({ checked, loading, onChange, label }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={loading}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        checked ? "bg-primary" : "bg-slate-300 dark:bg-slate-700",
        loading && "opacity-60 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

function StatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        enabled
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
      )}
    >
      {enabled ? "Habilitado" : "Deshabilitado"}
    </span>
  );
}

interface BusinessProfileFormsCardProps {
  companyId: string;
  company: Company;
  canEdit: boolean;
  onCompanyChange?: (company: Company) => void;
}

// Sección "Perfil de negocio y formatos activos" (src/app/settings y
// src/app/admin/companies). El componente es el mismo para ambas rutas; lo
// que cambia entre self-service (empresa propia) y el panel de bpm_admin
// (cualquier empresa) es únicamente companyId + canEdit. Si canEdit es
// false (supervisor/operario) no se renderiza ningún <select>/<button> de
// edición, solo texto/estado — no basta con deshabilitarlos.
export function BusinessProfileFormsCard({
  companyId,
  company,
  canEdit,
  onCompanyChange,
}: BusinessProfileFormsCardProps) {
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(company.businessProfile);
  const [forms, setForms] = useState<CompanyDailyFormStatus[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingFormType, setSavingFormType] = useState<DailyFormType | null>(null);

  // La empresa mostrada puede cambiar sin desmontar el componente (p.ej. al
  // elegir otra empresa en /admin/companies), así que businessProfile y forms
  // deben resincronizarse. Se ajusta durante el render (patrón oficial de
  // React para "adjusting state when a prop changes") en vez de en un
  // efecto, para no disparar un render en cascada.
  const [prevCompanyId, setPrevCompanyId] = useState(companyId);
  if (companyId !== prevCompanyId) {
    setPrevCompanyId(companyId);
    setBusinessProfile(company.businessProfile);
    setForms(null);
  }

  const loadForms = useCallback(async () => {
    try {
      const data = await api.get<CompanyDailyFormStatus[]>(`/companies/${companyId}/enabled-forms`);
      setForms(data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar los formatos activos.");
    }
  }, [companyId]);

  useEffect(() => {
    queueMicrotask(loadForms);
  }, [companyId, loadForms]);

  const handleBusinessProfileChange = async (value: BusinessProfile) => {
    if (!canEdit) return;
    const previous = businessProfile;
    setBusinessProfile(value);
    setSavingProfile(true);
    setError(null);
    try {
      const { company: updated } = await api.patch<{ company: Company }>(`/companies/${companyId}`, {
        businessProfile: value,
      });
      setBusinessProfile(updated.businessProfile);
      onCompanyChange?.(updated);
    } catch (err) {
      setBusinessProfile(previous);
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar el perfil de negocio.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleToggle = async (formType: DailyFormType) => {
    if (!canEdit || !forms) return;
    const previous = forms;
    const isEnabled = previous.find((f) => f.formType === formType)?.enabled ?? false;
    const optimistic = previous.map((f) => (f.formType === formType ? { ...f, enabled: !isEnabled } : f));
    const nextEnabledTypes = optimistic.filter((f) => f.enabled).map((f) => f.formType);

    setForms(optimistic);
    setSavingFormType(formType);
    setError(null);
    try {
      const updated = await api.patch<CompanyDailyFormStatus[]>(`/companies/${companyId}/enabled-forms`, {
        enabledFormTypes: nextEnabledTypes,
      });
      setForms(updated);
    } catch (err) {
      setForms(previous);
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar el formato.");
    } finally {
      setSavingFormType(null);
    }
  };

  const formsByType = new Map((forms ?? []).map((f) => [f.formType, f.enabled]));

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Perfil de negocio y formatos activos</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Define el tipo de negocio y qué formatos diarios debe diligenciar esta empresa.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadForms}
            className="inline-flex items-center gap-1.5 font-medium hover:underline shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reintentar
          </button>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de negocio</label>
        {canEdit ? (
          <div className="flex items-center gap-3">
            <select
              value={businessProfile}
              onChange={(e) => handleBusinessProfileChange(e.target.value as BusinessProfile)}
              disabled={savingProfile}
              className="w-full sm:w-72 bg-white dark:bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-60"
            >
              {BUSINESS_PROFILE_OPTIONS.map((profile) => (
                <option key={profile} value={profile}>
                  {BUSINESS_PROFILE_LABELS[profile]}
                </option>
              ))}
            </select>
            {savingProfile && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          </div>
        ) : (
          <p className="text-sm text-slate-900 dark:text-white font-medium">
            {BUSINESS_PROFILE_LABELS[businessProfile]}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Formatos diarios</label>
        {!forms && !error && (
          <div className="space-y-2">
            {DAILY_FORM_ORDER.map((formType) => (
              <div key={formType} className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        )}
        {forms && (
          <ul className="divide-y divide-border/50 border border-border/50 rounded-lg overflow-hidden">
            {DAILY_FORM_ORDER.map((formType) => {
              const enabled = formsByType.get(formType) ?? false;
              return (
                <li
                  key={formType}
                  className="flex items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-slate-900"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300">{DAILY_FORM_LABELS[formType]}</span>
                  {canEdit ? (
                    <ToggleSwitch
                      checked={enabled}
                      loading={savingFormType === formType}
                      onChange={() => handleToggle(formType)}
                      label={DAILY_FORM_LABELS[formType]}
                    />
                  ) : (
                    <StatusBadge enabled={enabled} />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
