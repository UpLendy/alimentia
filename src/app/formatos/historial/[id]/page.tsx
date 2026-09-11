"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api, ApiError, type DailyForm, type Sede } from "@/lib/api";
import { getDailyFormMeta, getResponsableLabel, shiftLabel } from "@/lib/daily-form-meta";
import { PayloadViewer } from "@/components/daily-forms/PayloadViewer";

// Vista de detalle 100% de solo lectura: no hay ningún botón de editar,
// guardar ni eliminar acá a propósito (ver historial/page.tsx). Una
// corrección de un registro se hace agregando una observación nueva desde el
// formulario correspondiente, nunca reescribiendo este registro.
export default function DetalleHistorialFormato() {
  const params = useParams<{ id: string }>();
  const [form, setForm] = useState<DailyForm | null>(null);
  const [sedeName, setSedeName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { dailyForm } = await api.get<{ dailyForm: DailyForm }>(`/daily-forms/${params.id}`);
        if (cancelled) return;
        setForm(dailyForm);
        try {
          const sedes = await api.get<Sede[]>("/sedes");
          if (!cancelled) setSedeName(sedes.find((s) => s.id === dailyForm.sedeId)?.name ?? null);
        } catch {
          // El nombre de la sede es solo informativo; si falla, se omite sin romper el detalle.
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError && err.status === 404
              ? "Este registro no existe o no pertenece a tu empresa."
              : "No se pudo cargar el registro.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/formatos/historial" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Volver al historial
      </Link>

      {isLoading && <div className="text-slate-500 dark:text-slate-400 py-12 text-center">Cargando...</div>}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900/40 p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {form && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/50 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  {(() => {
                    const meta = getDailyFormMeta(form.formType);
                    const Icon = meta.icon;
                    return (
                      <>
                        <span className={`p-2 rounded-xl ${meta.color}`}>
                          <Icon className="w-6 h-6" />
                        </span>
                        {meta.name}
                      </>
                    );
                  })()}
                </h1>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Solo lectura
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Fecha</dt>
                <dd className="font-medium text-slate-900 dark:text-white">{form.formDate}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Turno</dt>
                <dd className="font-medium text-slate-900 dark:text-white">{shiftLabel(form.shift)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Sede</dt>
                <dd className="font-medium text-slate-900 dark:text-white">{sedeName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Diligenciado por</dt>
                <dd className="font-medium text-slate-900 dark:text-white">
                  {getResponsableLabel(form.formType, form.payload, form.submittedBy)}
                </dd>
              </div>
            </div>

            {form.observations && (
              <div>
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Observaciones</dt>
                <dd className="text-sm text-slate-900 dark:text-white mt-1">{form.observations}</dd>
              </div>
            )}
          </div>

          <div className="p-6">
            <PayloadViewer formType={form.formType} payload={form.payload} />
          </div>
        </div>
      )}
    </div>
  );
}
