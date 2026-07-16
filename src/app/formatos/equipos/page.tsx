"use client";

import { Microwave, ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { DailyFormShift } from "@/lib/api";
import { useDailyFormSubmit } from "@/hooks/useDailyFormSubmit";

const EQUIPOS = ["Refrigerador Principal", "Estufa Industrial", "Licuadora", "Mesas en Acero Inoxidable"];

interface EquipoRow {
  limpio: boolean;
  buenEstado: boolean;
  requiereMantenimiento: boolean;
}

export default function FormatoEquipos() {
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [shift, setShift] = useState<DailyFormShift | "">("");
  const [responsable, setResponsable] = useState("");
  const [equipos, setEquipos] = useState<Record<string, EquipoRow>>(
    Object.fromEntries(EQUIPOS.map((eq) => [eq, { limpio: true, buenEstado: true, requiereMantenimiento: false }]))
  );

  const {
    sedes,
    sedesError,
    sedeId,
    setSedeId,
    showSedeSelector,
    isSubmitting,
    saveState,
    errorMessage,
    validationDetails,
    submit,
  } = useDailyFormSubmit("equipos");

  const updateRow = (eq: string, field: keyof EquipoRow, value: boolean) => {
    setEquipos((prev) => ({ ...prev, [eq]: { ...prev[eq], [field]: value } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({
      formDate,
      shift,
      payload: {
        responsable,
        equipos: EQUIPOS.map((eq) => ({
          equipo: eq,
          limpio: equipos[eq].limpio,
          buenEstado: equipos[eq].buenEstado,
          requiereMantenimiento: equipos[eq].requiereMantenimiento,
        })),
      },
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/infraestructura" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-amber-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Infraestructura
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <div className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 p-2 rounded-xl">
            <Microwave className="w-6 h-6" />
          </div>
          Estado y Limpieza de Equipos
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Revisión pre-operacional de equipos y utensilios (Res. 2674 Art. 8-9).</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-border/50 p-6 space-y-8">
        {sedesError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
            {sedesError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {showSedeSelector && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sede</label>
              <select
                required
                value={sedeId}
                onChange={(e) => setSedeId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none"
              >
                <option value="" disabled>Selecciona una sede</option>
                {sedes?.map((sede) => (
                  <option key={sede.id} value={sede.id}>{sede.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label>
            <input
              type="date"
              required
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Responsable</label>
            <input
              type="text"
              required
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Turno (opcional)</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value as DailyFormShift | "")}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-lg px-4 py-2 text-sm outline-none"
            >
              <option value="">Sin especificar</option>
              <option value="manana">Mañana</option>
              <option value="tarde">Tarde</option>
              <option value="noche">Noche</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold">Equipo / Utensilio</th>
                  <th className="px-4 py-3 font-semibold text-center">Limpio y Desinfectado</th>
                  <th className="px-4 py-3 font-semibold text-center">Buen Estado Físico</th>
                  <th className="px-4 py-3 font-semibold text-center">Requiere Mantenimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {EQUIPOS.map((eq) => (
                  <tr key={eq} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{eq}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={equipos[eq].limpio}
                        onChange={(e) => updateRow(eq, "limpio", e.target.checked)}
                        className="w-4 h-4 text-amber-600 rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={equipos[eq].buenEstado}
                        onChange={(e) => updateRow(eq, "buenEstado", e.target.checked)}
                        className="w-4 h-4 text-amber-600 rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={equipos[eq].requiereMantenimiento}
                        onChange={(e) => updateRow(eq, "requiereMantenimiento", e.target.checked)}
                        className="w-4 h-4 text-red-600 rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {saveState === "success" && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Registro guardado con éxito.
          </div>
        )}

        {saveState === "error" && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMessage}
            </div>
            {validationDetails && validationDetails.length > 0 && (
              <ul className="list-disc list-inside text-xs space-y-1 pl-1">
                {validationDetails.map((d, i) => (
                  <li key={i}>
                    <span className="font-mono">{d.path}</span>: {d.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-amber-600 hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Guardar Revisión
          </button>
        </div>
      </form>
    </div>
  );
}
