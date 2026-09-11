"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { api, ApiError, type Company } from "@/lib/api";
import { BusinessProfileFormsCard } from "@/components/company/BusinessProfileFormsCard";

export default function AdminCompaniesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [companyId, setCompanyId] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  const loadCompanies = useCallback(async () => {
    setError(null);
    try {
      const data = await api.get<Company[]>("/companies");
      setCompanies(data);
      setCompanyId((current) => current || data[0]?.id || "");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar las empresas.");
    }
  }, []);

  useEffect(() => {
    if (user?.role !== "bpm_admin") return;
    loadCompanies();
  }, [user, loadCompanies]);

  // Ver comentario del guard arriba: esto bloquea también el render mientras
  // se resuelve el rol y para cualquier rol distinto de bpm_admin.
  if (isAuthLoading || user?.role !== "bpm_admin") return null;

  const selectedCompany = companies?.find((c) => c.id === companyId) ?? null;

  const handleCompanyChange = (updated: Company) => {
    setCompanies((prev) => prev?.map((c) => (c.id === updated.id ? updated : c)) ?? prev);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <Building2 className="w-8 h-8" />
          Empresas
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Administra el perfil de negocio y los formatos activos de cualquier empresa cliente.
        </p>
      </header>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadCompanies}
            className="inline-flex items-center gap-1.5 font-medium hover:underline shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reintentar
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Empresa</label>
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          disabled={!companies || companies.length === 0}
          className="w-full sm:w-72 bg-white dark:bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-60"
        >
          {!companies && <option>Cargando...</option>}
          {companies?.length === 0 && <option>No hay empresas</option>}
          {companies?.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCompany && (
        <BusinessProfileFormsCard
          companyId={selectedCompany.id}
          company={selectedCompany}
          canEdit={true}
          onCompanyChange={handleCompanyChange}
        />
      )}
    </div>
  );
}
