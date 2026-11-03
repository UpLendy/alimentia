"use client";

import { useState } from "react";
import { Building2, CheckCircle2, Loader2 } from "lucide-react";
import { api, ApiError, type Company } from "@/lib/api";

const inputClass =
  "w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:opacity-60";
const labelClass = "text-sm font-medium text-slate-700 dark:text-slate-300";

interface BusinessInfoCardProps {
  company: Company;
  canEdit: boolean;
  onCompanyChange: (company: Company) => void;
}

// "Información del Negocio" (src/app/settings). Solo expone los campos que
// PATCH /companies/me acepta de un admin (name/nit/email/phone/address):
// plan y status viven aparte en CompanyPlanStatusCard porque el backend los
// restringe a bpm_admin (assertCanSetPlanOrStatus). Igual que
// BusinessProfileFormsCard, si canEdit es false no se renderiza ningún
// input, solo texto.
export function BusinessInfoCard({ company, canEdit, onCompanyChange }: BusinessInfoCardProps) {
  const [name, setName] = useState(company.name);
  const [nit, setNit] = useState(company.nit ?? "");
  const [email, setEmail] = useState(company.email ?? "");
  const [phone, setPhone] = useState(company.phone ?? "");
  const [address, setAddress] = useState(company.address ?? "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(false);

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setFormError("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    // El backend exige formato de correo válido si el campo viene en el
    // body (t.String({format:"email"})), así que un valor vacío no se
    // envía: esta pantalla no permite borrar el correo, solo cambiarlo.
    const trimmedEmail = email.trim();
    const payload: Record<string, string> = {
      name: trimmedName,
      nit: nit.trim(),
      phone: phone.trim(),
      address: address.trim(),
    };
    if (trimmedEmail) payload.email = trimmedEmail;

    setIsSubmitting(true);
    try {
      const { company: updated } = await api.patch<{ company: Company }>("/companies/me", payload);
      setName(updated.name);
      setNit(updated.nit ?? "");
      setEmail(updated.email ?? "");
      setPhone(updated.phone ?? "");
      setAddress(updated.address ?? "");
      onCompanyChange(updated);
      setSuccess(true);
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "No se pudo guardar la información de la empresa."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border/50 shadow-sm space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Información del Negocio</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Datos generales de tu empresa.</p>
        </div>
      </div>

      {canEdit ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
              {formError}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Los datos de la empresa se guardaron correctamente.
            </div>
          )}

          <fieldset className="space-y-4" disabled={isSubmitting}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>Razón Social</label>
                <input
                  type="text"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Teléfono</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Dirección</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputClass}
              />
            </div>
          </fieldset>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-primary/30 disabled:opacity-60 inline-flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      ) : (
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Razón Social</dt>
            <dd className="text-sm text-slate-900 dark:text-white font-medium">{company.name}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">NIT</dt>
            <dd className="text-sm text-slate-900 dark:text-white font-medium">{company.nit || "—"}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Correo Electrónico</dt>
            <dd className="text-sm text-slate-900 dark:text-white font-medium">{company.email || "—"}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Teléfono</dt>
            <dd className="text-sm text-slate-900 dark:text-white font-medium">{company.phone || "—"}</dd>
          </div>
          <div className="space-y-1 md:col-span-2">
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Dirección</dt>
            <dd className="text-sm text-slate-900 dark:text-white font-medium">{company.address || "—"}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
