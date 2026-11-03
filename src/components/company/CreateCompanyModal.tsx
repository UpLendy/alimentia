"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import {
  api,
  ApiError,
  type BusinessProfile,
  type CompanyPlan,
  type CompanyStatus,
  type CreateCompanyResult,
  type ValidationErrorDetail,
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

function trimOrUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const inputClass =
  "w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60";
const labelClass = "text-sm font-medium text-slate-700 dark:text-slate-300";

interface CreateCompanyModalProps {
  onClose: () => void;
  onSuccess: (result: CreateCompanyResult) => void;
}

// Modal de alta de empresa (solo bpm_admin, montado desde
// src/app/admin/companies/page.tsx). Llama a POST /companies, que crea
// empresa + primera sede + usuario admin + formatos por defecto en una
// sola operación atómica en el backend.
export function CreateCompanyModal({ onClose, onSuccess }: CreateCompanyModalProps) {
  const [name, setName] = useState("");
  const [nit, setNit] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [plan, setPlan] = useState<CompanyPlan>("basico");
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>("restaurante_general");
  const [status, setStatus] = useState<CompanyStatus>("prueba");
  const [sedeName, setSedeName] = useState("Principal");
  const [adminFullName, setAdminFullName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrorDetail[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors(null);

    try {
      const result = await api.post<CreateCompanyResult>("/companies", {
        name: name.trim(),
        nit: trimOrUndefined(nit),
        email: trimOrUndefined(email),
        phone: trimOrUndefined(phone),
        address: trimOrUndefined(address),
        plan,
        businessProfile,
        status,
        sede: { name: sedeName.trim() || "Principal" },
        admin: {
          fullName: adminFullName.trim(),
          email: adminEmail.trim(),
        },
      });
      onSuccess(result);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(
          err.status === 409
            ? err.message
            : err.message || "No se pudo crear la empresa."
        );
        setFieldErrors(err.details?.length ? err.details : null);
      } else {
        setFormError("No se pudo crear la empresa.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-border/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nueva empresa</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Crea la empresa, su primera sede y el usuario administrador inicial.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {formError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium space-y-1.5">
              <p>{formError}</p>
              {fieldErrors && (
                <ul className="list-disc list-inside text-xs font-normal space-y-0.5">
                  {fieldErrors.map((detail, i) => (
                    <li key={i}>
                      {detail.path}: {detail.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <fieldset className="space-y-4" disabled={isSubmitting}>
            <legend className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Datos de la empresa</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <label className={labelClass}>Nombre *</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>NIT</label>
                <input type="text" value={nit} onChange={(e) => setNit(e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Correo</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Teléfono</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Dirección</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Plan</label>
                <select value={plan} onChange={(e) => setPlan(e.target.value as CompanyPlan)} className={inputClass}>
                  {PLAN_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {PLAN_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Tipo de negocio</label>
                <select
                  value={businessProfile}
                  onChange={(e) => setBusinessProfile(e.target.value as BusinessProfile)}
                  className={inputClass}
                >
                  {BUSINESS_PROFILE_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {BUSINESS_PROFILE_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Estado</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as CompanyStatus)} className={inputClass}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4" disabled={isSubmitting}>
            <legend className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Primera sede</legend>
            <div className="space-y-2">
              <label className={labelClass}>Nombre</label>
              <input
                type="text"
                value={sedeName}
                onChange={(e) => setSedeName(e.target.value)}
                placeholder="Principal"
                className={inputClass}
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4" disabled={isSubmitting}>
            <legend className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Administrador inicial</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>Nombre completo *</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={adminFullName}
                  onChange={(e) => setAdminFullName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Correo *</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </fieldset>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-60 inline-flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Creando..." : "Crear empresa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
